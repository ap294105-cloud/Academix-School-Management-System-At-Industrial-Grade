import { drizzle } from 'drizzle-orm/netlify-db';
import { relations } from './schema.js';

// Connection details are provided automatically by Netlify Database.
// Typed as the node-postgres variant so the relational query API is fully typed.
export const db = drizzle({ relations }) as unknown as import('drizzle-orm/node-postgres').NodePgDatabase<
  Record<string, never>,
  typeof relations
>;
