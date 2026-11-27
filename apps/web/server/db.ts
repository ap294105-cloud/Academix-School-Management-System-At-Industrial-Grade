/**
 * Prisma-compatible data access layer backed by Drizzle ORM and Netlify Database.
 *
 * The controllers were originally written against Prisma (on a SQLite file, which
 * cannot be written to in serverless environments). This module exposes the subset
 * of the Prisma Client API they use — findMany/findFirst/findUnique, create,
 * createMany, update, updateMany, upsert, delete, deleteMany, count and aggregate
 * with `where`, `include`, `select`, `orderBy`, `take` and `skip` — and translates
 * each call into Drizzle relational queries against Postgres.
 */
import { getTableColumns, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

type Row = Record<string, any>;

// Prisma model accessor name -> Drizzle table key
const MODEL_TABLES = {
  user: 'users',
  teacherProfile: 'teacherProfiles',
  parentProfile: 'parentProfiles',
  class: 'classes',
  studentProfile: 'studentProfiles',
  subject: 'subjects',
  attendance: 'attendance',
  mark: 'marks',
  feeInvoice: 'feeInvoices',
  notification: 'notifications',
  auditLog: 'auditLogs',
  badge: 'badges',
  disciplinaryRecord: 'disciplinaryRecords',
  leaveRequest: 'leaveRequests',
  lessonPlan: 'lessonPlans',
  expense: 'expenses',
  maintenanceTicket: 'maintenanceTickets',
  cafeteriaOrder: 'cafeteriaOrders',
  event: 'events',
  syllabus: 'syllabi',
  assignmentSubmission: 'assignmentSubmissions',
  quiz: 'quizzes',
  question: 'questions',
  book: 'books',
  bookCheckout: 'bookCheckouts',
  asset: 'assets',
  procurementQuote: 'procurementQuotes',
  biometricLog: 'biometricLogs',
  disciplinaryIncident: 'disciplinaryIncidents',
  parentTeacherMeeting: 'parentTeacherMeetings',
  appPackage: 'appPackages',
  appInstance: 'appInstances',
  medicalRecord: 'medicalRecords',
  resourceRequisition: 'resourceRequisitions',
  professionalDevelopment: 'professionalDevelopments',
  rbacPolicy: 'rbacPolicies',
  announcement: 'announcements',
  announcementFeedback: 'announcementFeedback',
} as const;

const relationsConfig = schema.relations as unknown as Record<
  string,
  { table: any; relations: Record<string, any> }
>;

interface RelationInfo {
  target: string;
  kind: 'one' | 'many';
  /** column key on the related table that holds this row's id (for "many" relations) */
  foreignKey?: string;
}

function columnKey(table: any, column: any): string {
  const entry = Object.entries(getTableColumns(table)).find(([, c]) => c === column);
  if (!entry) throw new Error(`Unknown column ${column?.name}`);
  return entry[0];
}

const tableKeyByTable = new Map<any, string>();
for (const [key, cfg] of Object.entries(relationsConfig)) tableKeyByTable.set(cfg.table, key);

const relationInfo: Record<string, Record<string, RelationInfo>> = {};
for (const [key, cfg] of Object.entries(relationsConfig)) {
  relationInfo[key] = {};
  for (const [field, rel] of Object.entries(cfg.relations)) {
    const target = tableKeyByTable.get(rel.targetTable)!;
    const kind = rel.relationType === 'many' || rel.constructor.name === 'Many' ? 'many' : 'one';
    relationInfo[key][field] = {
      target,
      kind,
      foreignKey: kind === 'many' ? columnKey(rel.targetTable, rel.targetColumns[0]) : undefined,
    };
  }
}

function isPlainObject(v: unknown): v is Row {
  return typeof v === 'object' && v !== null && !(v instanceof Date) && !Array.isArray(v);
}

/** Prisma `where` -> Drizzle RQB v2 `where` */
function translateWhere(tableKey: string, where: Row | undefined): Row | undefined {
  if (!where) return undefined;
  const out: Row = {};
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;
    if (key === 'AND' || key === 'OR') {
      const list = (Array.isArray(value) ? value : [value]).map((w) => translateWhere(tableKey, w));
      out[key] = list;
      continue;
    }
    if (key === 'NOT') {
      out.NOT = translateWhere(tableKey, Array.isArray(value) ? { AND: value } : value);
      continue;
    }
    const rel = relationInfo[tableKey][key];
    if (rel) {
      if (value === null) {
        out[key] = { NOT: {} };
      } else if ('some' in value) {
        out[key] = translateWhere(rel.target, value.some) ?? true;
      } else if ('none' in value) {
        out.NOT = { ...(out.NOT || {}), [key]: translateWhere(rel.target, value.none) ?? true };
      } else if ('every' in value) {
        out.NOT = { ...(out.NOT || {}), [key]: { NOT: translateWhere(rel.target, value.every) ?? {} } };
      } else {
        out[key] = translateWhere(rel.target, (value as Row).is ?? value);
      }
      continue;
    }
    if (value === null) {
      out[key] = { isNull: true };
    } else if (isPlainObject(value)) {
      const ops: Row = {};
      for (const [op, v] of Object.entries(value)) {
        if (v === undefined || op === 'mode') continue;
        switch (op) {
          case 'equals':
            ops[v === null ? 'isNull' : 'eq'] = v === null ? true : v;
            break;
          case 'not':
            if (v === null) ops.isNotNull = true;
            else if (isPlainObject(v)) ops.NOT = translateWhere(tableKey, { [key]: v })![key];
            else ops.ne = v;
            break;
          case 'in':
          case 'notIn':
          case 'lt':
          case 'lte':
          case 'gt':
          case 'gte':
            ops[op] = v;
            break;
          case 'contains':
            ops[value.mode === 'insensitive' ? 'ilike' : 'like'] = `%${v}%`;
            break;
          case 'startsWith':
            ops[value.mode === 'insensitive' ? 'ilike' : 'like'] = `${v}%`;
            break;
          case 'endsWith':
            ops[value.mode === 'insensitive' ? 'ilike' : 'like'] = `%${v}`;
            break;
          default:
            throw new Error(`Unsupported where operator "${op}" on ${tableKey}.${key}`);
        }
      }
      out[key] = ops;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function translateOrderBy(orderBy: Row | Row[] | undefined): Row | undefined {
  if (!orderBy) return undefined;
  return Array.isArray(orderBy) ? Object.assign({}, ...orderBy) : orderBy;
}

interface CountRequest {
  [relation: string]: true;
}

/** Prisma find args -> Drizzle RQB v2 query config (+ bookkeeping for _count) */
function translateQuery(tableKey: string, args: Row = {}): { config: Row; counts: CountRequest; hidden: string[] } {
  const config: Row = {};
  const counts: CountRequest = {};
  const hidden: string[] = [];
  const where = translateWhere(tableKey, args.where);
  if (where && Object.keys(where).length) config.where = where;
  const orderBy = translateOrderBy(args.orderBy);
  if (orderBy) config.orderBy = orderBy;
  if (args.take !== undefined) config.limit = args.take;
  if (args.skip !== undefined) config.offset = args.skip;

  const withConfig: Row = {};
  const nested: Record<string, { counts: CountRequest; hidden: string[] }> = {};

  const addRelation = (field: string, value: any) => {
    const rel = relationInfo[tableKey][field];
    if (!rel) throw new Error(`Unknown relation "${field}" on ${tableKey}`);
    if (value === true) {
      withConfig[field] = true;
    } else if (isPlainObject(value)) {
      const sub = translateQuery(rel.target, value);
      withConfig[field] = Object.keys(sub.config).length ? sub.config : true;
      nested[field] = { counts: sub.counts, hidden: sub.hidden };
    }
  };

  const addCounts = (countArg: any) => {
    const fields = countArg === true ? Object.keys(relationInfo[tableKey]).filter((f) => relationInfo[tableKey][f].kind === 'many') : Object.keys(countArg.select ?? {});
    for (const f of fields) {
      counts[f] = true;
      if (!(f in withConfig)) {
        withConfig[f] = { columns: { id: true } };
        hidden.push(f);
      }
    }
  };

  if (args.select) {
    const columns: Row = {};
    for (const [field, value] of Object.entries(args.select)) {
      if (!value) continue;
      if (field === '_count') continue;
      if (relationInfo[tableKey][field]) addRelation(field, value);
      else columns[field] = true;
    }
    if (args.select._count) addCounts(args.select._count);
    config.columns = columns;
  } else if (args.include) {
    for (const [field, value] of Object.entries(args.include)) {
      if (!value || field === '_count') continue;
      addRelation(field, value);
    }
    if (args.include._count) addCounts(args.include._count);
  }

  if (Object.keys(withConfig).length) config.with = withConfig;
  (config as any).__nested = nested;
  return { config, counts, hidden };
}

function stripInternal(config: Row): Row {
  const { __nested, ...rest } = config;
  if (rest.with) {
    rest.with = Object.fromEntries(
      Object.entries(rest.with).map(([k, v]) => [k, isPlainObject(v) ? stripInternal(v as Row) : v]),
    );
  }
  return rest;
}

function postProcess(row: Row | undefined | null, config: Row, counts: CountRequest, hidden: string[]): any {
  if (!row) return row ?? null;
  const nested = config.__nested as Record<string, { counts: CountRequest; hidden: string[] }>;
  for (const [field, info] of Object.entries(nested ?? {})) {
    const sub = config.with[field];
    const value = row[field];
    if (Array.isArray(value)) row[field] = value.map((r) => postProcess(r, sub, info.counts, info.hidden));
    else if (value) row[field] = postProcess(value, sub, info.counts, info.hidden);
  }
  if (Object.keys(counts).length) {
    row._count = {};
    for (const f of Object.keys(counts)) row._count[f] = Array.isArray(row[f]) ? row[f].length : 0;
    for (const f of hidden) delete row[f];
  }
  return row;
}

function table(tableKey: string): any {
  return (schema as any)[tableKey];
}

function queryApi(tableKey: string): any {
  return (db.query as any)[tableKey];
}

class RecordNotFoundError extends Error {
  code = 'P2025';
  constructor(model: string) {
    super(`No ${model} record found for the given criteria`);
  }
}

/** Splits Prisma `data` into scalar column values and nested relation writes */
function splitData(tableKey: string, data: Row) {
  const columns = getTableColumns(table(tableKey));
  const values: Row = {};
  const nestedCreates: Array<{ field: string; rows: Row[] }> = [];
  for (const [key, value] of Object.entries(data ?? {})) {
    if (value === undefined) continue;
    const rel = relationInfo[tableKey][key];
    if (rel) {
      if (isPlainObject(value) && value.connect && rel.kind === 'one') {
        const fkEntry = Object.entries(relationsConfig[tableKey].relations[key].sourceColumns ?? [])[0];
        if (fkEntry) values[columnKey(table(tableKey), fkEntry[1])] = value.connect.id;
      } else if (isPlainObject(value) && value.create) {
        nestedCreates.push({ field: key, rows: Array.isArray(value.create) ? value.create : [value.create] });
      } else {
        throw new Error(`Unsupported nested write on ${tableKey}.${key}`);
      }
      continue;
    }
    if (!(key in columns)) continue;
    values[key] = value;
  }
  return { values, nestedCreates };
}

function buildModel(model: string, tableKey: string) {
  const t = table(tableKey);

  const findMany = async (args: Row = {}) => {
    const { config, counts, hidden } = translateQuery(tableKey, args);
    const rows: Row[] = await queryApi(tableKey).findMany(stripInternal(config));
    return rows.map((r) => postProcess(r, config, counts, hidden));
  };

  const findFirst = async (args: Row = {}) => {
    const { config, counts, hidden } = translateQuery(tableKey, args);
    const row = await queryApi(tableKey).findFirst(stripInternal(config));
    return postProcess(row, config, counts, hidden);
  };

  const findOrThrow = async (args: Row = {}) => {
    const row = await findFirst(args);
    if (!row) throw new RecordNotFoundError(model);
    return row;
  };

  const reload = async (id: string, args: Row) => {
    if (!args.include && !args.select) return null;
    return findFirst({ where: { id }, include: args.include, select: args.select });
  };

  const idsFor = async (where: Row | undefined) => {
    const rows = await findMany({ where, select: { id: true } });
    return rows.map((r: Row) => r.id as string);
  };

  const insertOne = async (data: Row): Promise<Row> => {
    const { values, nestedCreates } = splitData(tableKey, data);
    const [row] = await (db as any).insert(t).values(values).returning();
    for (const { field, rows } of nestedCreates) {
      const rel = relationInfo[tableKey][field];
      if (rel.kind !== 'many' || !rel.foreignKey) throw new Error(`Unsupported nested create on ${tableKey}.${field}`);
      const child = buildModel(field, rel.target);
      for (const r of rows) await child.create({ data: { ...r, [rel.foreignKey]: row.id } });
    }
    return row;
  };

  const applyUpdateOperators = (current: Row, data: Row): Row => {
    const { values } = splitData(tableKey, data);
    for (const [key, value] of Object.entries(values)) {
      if (isPlainObject(value)) {
        if ('increment' in value) values[key] = (current[key] ?? 0) + value.increment;
        else if ('decrement' in value) values[key] = (current[key] ?? 0) - value.decrement;
        else if ('multiply' in value) values[key] = (current[key] ?? 0) * value.multiply;
        else if ('divide' in value) values[key] = (current[key] ?? 0) / value.divide;
        else if ('set' in value) values[key] = value.set;
      }
    }
    for (const [key, col] of Object.entries(getTableColumns(t)) as Array<[string, any]>) {
      if (col.onUpdateFn && !(key in values)) values[key] = col.onUpdateFn();
    }
    return values;
  };

  const updateRow = async (current: Row, data: Row) => {
    const values = applyUpdateOperators(current, data);
    if (!Object.keys(values).length) return current;
    const [row] = await (db as any).update(t).set(values).where(inArray(t.id, [current.id])).returning();
    return row;
  };

  return {
    findMany,
    findFirst,
    findUnique: findFirst,
    findFirstOrThrow: findOrThrow,
    findUniqueOrThrow: findOrThrow,

    async create(args: Row) {
      const row = await insertOne(args.data);
      return (await reload(row.id, args)) ?? row;
    },

    async createMany(args: Row) {
      const list: Row[] = Array.isArray(args.data) ? args.data : [args.data];
      if (!list.length) return { count: 0 };
      const values = list.map((d) => splitData(tableKey, d).values);
      const query = (db as any).insert(t).values(values);
      const rows = await (args.skipDuplicates ? query.onConflictDoNothing() : query).returning();
      return { count: rows.length };
    },

    async update(args: Row) {
      const current = await findFirst({ where: args.where });
      if (!current) throw new RecordNotFoundError(model);
      const row = await updateRow(current, args.data);
      return (await reload(row.id, args)) ?? row;
    },

    async updateMany(args: Row = {}) {
      const rows = await findMany({ where: args.where });
      for (const current of rows) await updateRow(current, args.data);
      return { count: rows.length };
    },

    async upsert(args: Row) {
      const current = await findFirst({ where: args.where });
      if (current) {
        const row = await updateRow(current, args.update ?? {});
        return (await reload(row.id, args)) ?? row;
      }
      const row = await insertOne(args.create);
      return (await reload(row.id, args)) ?? row;
    },

    async delete(args: Row) {
      const current = await findFirst({ where: args.where, include: args.include, select: args.select });
      if (!current) throw new RecordNotFoundError(model);
      const id = current.id ?? (await findFirst({ where: args.where, select: { id: true } }))?.id;
      await (db as any).delete(t).where(inArray(t.id, [id]));
      return current;
    },

    async deleteMany(args: Row = {}) {
      if (!args.where || !Object.keys(args.where).length) {
        const rows = await (db as any).delete(t).returning({ id: t.id });
        return { count: rows.length };
      }
      const ids = await idsFor(args.where);
      if (ids.length) await (db as any).delete(t).where(inArray(t.id, ids));
      return { count: ids.length };
    },

    async count(args: Row = {}) {
      return (await idsFor(args.where)).length;
    },

    async aggregate(args: Row = {}) {
      const rows: Row[] = await findMany({ where: args.where, orderBy: args.orderBy, take: args.take, skip: args.skip });
      const result: Row = {};
      const fieldsOf = (spec: Row | undefined) => Object.keys(spec ?? {}).filter((k) => spec![k]);
      if (args._count) result._count = args._count === true ? rows.length : Object.fromEntries(fieldsOf(args._count).map((f) => [f, rows.filter((r) => f === '_all' || r[f] != null).length]));
      const numbers = (f: string) => rows.map((r) => r[f]).filter((v) => v != null) as number[];
      if (args._sum) result._sum = Object.fromEntries(fieldsOf(args._sum).map((f) => [f, numbers(f).length ? numbers(f).reduce((a, b) => a + b, 0) : null]));
      if (args._avg) result._avg = Object.fromEntries(fieldsOf(args._avg).map((f) => [f, numbers(f).length ? numbers(f).reduce((a, b) => a + b, 0) / numbers(f).length : null]));
      if (args._min) result._min = Object.fromEntries(fieldsOf(args._min).map((f) => [f, numbers(f).length ? numbers(f).reduce((a, b) => (b < a ? b : a)) : null]));
      if (args._max) result._max = Object.fromEntries(fieldsOf(args._max).map((f) => [f, numbers(f).length ? numbers(f).reduce((a, b) => (b > a ? b : a)) : null]));
      return result;
    },
  };
}

type ModelClient = ReturnType<typeof buildModel>;

const prisma = Object.fromEntries(
  Object.entries(MODEL_TABLES).map(([model, tableKey]) => [model, buildModel(model, tableKey)]),
) as { [K in keyof typeof MODEL_TABLES]: ModelClient };

export default prisma;
