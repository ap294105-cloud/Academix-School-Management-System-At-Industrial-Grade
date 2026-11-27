// Generated from the original Prisma schema. Table variable names are camelCase plurals.
import { pgTable, text, doublePrecision, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { defineRelations } from 'drizzle-orm';

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const teacherProfiles = pgTable('teacher_profiles', {
  id: id(),
  userId: text('user_id').notNull().unique().references((): any => users.id, { onDelete: 'cascade' }),
  employeeId: text('employee_id').notNull().unique(),
  department: text('department').notNull(),
});

export const parentProfiles = pgTable('parent_profiles', {
  id: id(),
  userId: text('user_id').notNull().unique().references((): any => users.id, { onDelete: 'cascade' }),
  phone: text('phone').notNull(),
});

export const classes = pgTable('classes', {
  id: id(),
  name: text('name').notNull(),
  section: text('section').notNull(),
  teacherId: text('teacher_id').references((): any => teacherProfiles.id),
});

export const studentProfiles = pgTable('student_profiles', {
  id: id(),
  userId: text('user_id').notNull().unique().references((): any => users.id, { onDelete: 'cascade' }),
  admissionNo: text('admission_no').notNull().unique(),
  classId: text('class_id').references((): any => classes.id),
  parentId: text('parent_id').references((): any => parentProfiles.id),
});

export const subjects = pgTable('subjects', {
  id: id(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
});

export const attendance = pgTable('attendance', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references((): any => classes.id, { onDelete: 'cascade' }),
  date: ts('date').notNull(),
  status: text('status').notNull(),
  remarks: text('remarks'),
});

export const marks = pgTable('marks', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references((): any => subjects.id, { onDelete: 'cascade' }),
  examType: text('exam_type').notNull(),
  score: doublePrecision('score').notNull(),
  maxScore: doublePrecision('max_score').notNull(),
  date: ts('date').notNull(),
});

export const feeInvoices = pgTable('fee_invoices', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  amount: doublePrecision('amount').notNull(),
  dueDate: ts('due_date').notNull(),
  status: text('status').notNull(),
  paidAt: ts('paid_at'),
  transactionId: text('transaction_id'),
  description: text('description').notNull(),
});

export const notifications = pgTable('notifications', {
  id: id(),
  userId: text('user_id').notNull().references((): any => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: id(),
  action: text('action').notNull(),
  performedBy: text('performed_by').notNull(),
  details: text('details').notNull(),
  timestamp: ts('timestamp').notNull().defaultNow(),
});

export const badges = pgTable('badges', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  dateEarned: ts('date_earned').notNull().defaultNow(),
});

export const disciplinaryRecords = pgTable('disciplinary_records', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(),
  date: ts('date').notNull().defaultNow(),
});

export const leaveRequests = pgTable('leave_requests', {
  id: id(),
  teacherId: text('teacher_id').notNull().references((): any => teacherProfiles.id, { onDelete: 'cascade' }),
  startDate: ts('start_date').notNull(),
  endDate: ts('end_date').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const lessonPlans = pgTable('lesson_plans', {
  id: id(),
  teacherId: text('teacher_id').notNull().references((): any => teacherProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  className: text('class_name').notNull(),
  subjectName: text('subject_name').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const expenses = pgTable('expenses', {
  id: id(),
  amount: doublePrecision('amount').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  date: ts('date').notNull().defaultNow(),
});

export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: id(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(),
  location: text('location').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const cafeteriaOrders = pgTable('cafeteria_orders', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  itemNames: text('item_names').notNull(),
  totalPrice: doublePrecision('total_price').notNull(),
  orderDate: ts('order_date').notNull().defaultNow(),
  status: text('status').notNull(),
});

export const events = pgTable('events', {
  id: id(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  startDate: ts('start_date').notNull(),
  endDate: ts('end_date').notNull(),
  location: text('location').notNull(),
});

export const syllabi = pgTable('syllabi', {
  id: id(),
  teacherId: text('teacher_id').notNull().references((): any => teacherProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  grade: text('grade').notNull(),
  weeks: integer('weeks').notNull().default(30),
  content: text('content').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  filePath: text('file_path').notNull(),
  matchRate: doublePrecision('match_rate').notNull(),
  aiRate: doublePrecision('ai_rate').notNull(),
  report: text('report').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const quizzes = pgTable('quizzes', {
  id: id(),
  teacherId: text('teacher_id').notNull().references((): any => teacherProfiles.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references((): any => classes.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const questions = pgTable('questions', {
  id: id(),
  quizId: text('quiz_id').notNull().references((): any => quizzes.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: text('options').notNull(),
  answer: text('answer').notNull(),
});

export const books = pgTable('books', {
  id: id(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  barcode: text('barcode').notNull().unique(),
  quantity: integer('quantity').notNull().default(1),
  pdfUrl: text('pdf_url'),
});

export const bookCheckouts = pgTable('book_checkouts', {
  id: id(),
  bookId: text('book_id').notNull().references((): any => books.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  checkoutDate: ts('checkout_date').notNull().defaultNow(),
  returnDate: ts('return_date'),
  status: text('status').notNull(),
});

export const assets = pgTable('assets', {
  id: id(),
  name: text('name').notNull(),
  barcode: text('barcode').notNull().unique(),
  category: text('category').notNull(),
  purchaseDate: ts('purchase_date').notNull(),
  cost: doublePrecision('cost').notNull(),
  depreciationRate: doublePrecision('depreciation_rate').notNull(),
  maintenanceSchedule: text('maintenance_schedule').notNull(),
});

export const procurementQuotes = pgTable('procurement_quotes', {
  id: id(),
  vendorName: text('vendor_name').notNull(),
  particulars: text('particulars').notNull(),
  amount: doublePrecision('amount').notNull(),
  status: text('status').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const biometricLogs = pgTable('biometric_logs', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  timestamp: ts('timestamp').notNull().defaultNow(),
  gate: text('gate').notNull(),
});

export const disciplinaryIncidents = pgTable('disciplinary_incidents', {
  id: id(),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references((): any => teacherProfiles.id, { onDelete: 'cascade' }),
  severity: text('severity').notNull(),
  description: text('description').notNull(),
  actionTaken: text('action_taken').notNull(),
  status: text('status').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const parentTeacherMeetings = pgTable('parent_teacher_meetings', {
  id: id(),
  parentId: text('parent_id').notNull().references((): any => parentProfiles.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references((): any => teacherProfiles.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  date: ts('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  status: text('status').notNull(),
});

export const appPackages = pgTable('app_packages', {
  id: id(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  isInstalled: boolean('is_installed').notNull().default(false),
  configSchema: text('config_schema').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const appInstances = pgTable('app_instances', {
  id: id(),
  packageId: text('package_id').notNull().references((): any => appPackages.id, { onDelete: 'cascade' }),
  configData: text('config_data').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const medicalRecords = pgTable('medical_records', {
  id: id(),
  studentId: text('student_id').notNull().unique().references((): any => studentProfiles.id, { onDelete: 'cascade' }),
  allergies: text('allergies').notNull(),
  medicalHistory: text('medical_history').notNull(),
  immunizationChecks: text('immunization_checks').notNull(),
  updatedAt: ts('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const resourceRequisitions = pgTable('resource_requisitions', {
  id: id(),
  teacherId: text('teacher_id').notNull().references((): any => teacherProfiles.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  estimatedCost: doublePrecision('estimated_cost').notNull(),
  status: text('status').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const professionalDevelopments = pgTable('professional_developments', {
  id: id(),
  teacherId: text('teacher_id').notNull().references((): any => teacherProfiles.id, { onDelete: 'cascade' }),
  courseTitle: text('course_title').notNull(),
  creditsEarned: integer('credits_earned').notNull(),
  completionDate: ts('completion_date').notNull(),
  status: text('status').notNull(),
});

export const rbacPolicies = pgTable('rbac_policies', {
  id: id(),
  role: text('role').notNull(),
  resource: text('resource').notNull(),
  canRead: boolean('can_read').notNull().default(true),
  canWrite: boolean('can_write').notNull().default(false),
});

export const announcements = pgTable('announcements', {
  id: id(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorRole: text('author_role').notNull(),
  category: text('category').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const announcementFeedback = pgTable('announcement_feedback', {
  id: id(),
  announcementId: text('announcement_id').notNull().references((): any => announcements.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references((): any => users.id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const relations = defineRelations({ users, teacherProfiles, parentProfiles, classes, studentProfiles, subjects, attendance, marks, feeInvoices, notifications, auditLogs, badges, disciplinaryRecords, leaveRequests, lessonPlans, expenses, maintenanceTickets, cafeteriaOrders, events, syllabi, assignmentSubmissions, quizzes, questions, books, bookCheckouts, assets, procurementQuotes, biometricLogs, disciplinaryIncidents, parentTeacherMeetings, appPackages, appInstances, medicalRecords, resourceRequisitions, professionalDevelopments, rbacPolicies, announcements, announcementFeedback }, (r) => ({
  users: {
    teacher: r.one.teacherProfiles({ from: r.users.id, to: r.teacherProfiles.userId }),
    student: r.one.studentProfiles({ from: r.users.id, to: r.studentProfiles.userId }),
    parent: r.one.parentProfiles({ from: r.users.id, to: r.parentProfiles.userId }),
    notifications: r.many.notifications({ from: r.users.id, to: r.notifications.userId }),
    feedback: r.many.announcementFeedback({ from: r.users.id, to: r.announcementFeedback.userId }),
  },
  teacherProfiles: {
    user: r.one.users({ from: r.teacherProfiles.userId, to: r.users.id, optional: false }),
    classes: r.many.classes({ from: r.teacherProfiles.id, to: r.classes.teacherId }),
    leaveRequests: r.many.leaveRequests({ from: r.teacherProfiles.id, to: r.leaveRequests.teacherId }),
    lessonPlans: r.many.lessonPlans({ from: r.teacherProfiles.id, to: r.lessonPlans.teacherId }),
    syllabi: r.many.syllabi({ from: r.teacherProfiles.id, to: r.syllabi.teacherId }),
    quizzes: r.many.quizzes({ from: r.teacherProfiles.id, to: r.quizzes.teacherId }),
    incidents: r.many.disciplinaryIncidents({ from: r.teacherProfiles.id, to: r.disciplinaryIncidents.teacherId }),
    meetings: r.many.parentTeacherMeetings({ from: r.teacherProfiles.id, to: r.parentTeacherMeetings.teacherId }),
    requisitions: r.many.resourceRequisitions({ from: r.teacherProfiles.id, to: r.resourceRequisitions.teacherId }),
    development: r.many.professionalDevelopments({ from: r.teacherProfiles.id, to: r.professionalDevelopments.teacherId }),
  },
  parentProfiles: {
    user: r.one.users({ from: r.parentProfiles.userId, to: r.users.id, optional: false }),
    students: r.many.studentProfiles({ from: r.parentProfiles.id, to: r.studentProfiles.parentId }),
    meetings: r.many.parentTeacherMeetings({ from: r.parentProfiles.id, to: r.parentTeacherMeetings.parentId }),
  },
  classes: {
    teacher: r.one.teacherProfiles({ from: r.classes.teacherId, to: r.teacherProfiles.id }),
    students: r.many.studentProfiles({ from: r.classes.id, to: r.studentProfiles.classId }),
    attendance: r.many.attendance({ from: r.classes.id, to: r.attendance.classId }),
    quizzes: r.many.quizzes({ from: r.classes.id, to: r.quizzes.classId }),
  },
  studentProfiles: {
    user: r.one.users({ from: r.studentProfiles.userId, to: r.users.id, optional: false }),
    class: r.one.classes({ from: r.studentProfiles.classId, to: r.classes.id }),
    parent: r.one.parentProfiles({ from: r.studentProfiles.parentId, to: r.parentProfiles.id }),
    attendance: r.many.attendance({ from: r.studentProfiles.id, to: r.attendance.studentId }),
    marks: r.many.marks({ from: r.studentProfiles.id, to: r.marks.studentId }),
    feeInvoices: r.many.feeInvoices({ from: r.studentProfiles.id, to: r.feeInvoices.studentId }),
    badges: r.many.badges({ from: r.studentProfiles.id, to: r.badges.studentId }),
    disciplinary: r.many.disciplinaryRecords({ from: r.studentProfiles.id, to: r.disciplinaryRecords.studentId }),
    cafeteria: r.many.cafeteriaOrders({ from: r.studentProfiles.id, to: r.cafeteriaOrders.studentId }),
    submissions: r.many.assignmentSubmissions({ from: r.studentProfiles.id, to: r.assignmentSubmissions.studentId }),
    checkouts: r.many.bookCheckouts({ from: r.studentProfiles.id, to: r.bookCheckouts.studentId }),
    biometrics: r.many.biometricLogs({ from: r.studentProfiles.id, to: r.biometricLogs.studentId }),
    incidents: r.many.disciplinaryIncidents({ from: r.studentProfiles.id, to: r.disciplinaryIncidents.studentId }),
    meetings: r.many.parentTeacherMeetings({ from: r.studentProfiles.id, to: r.parentTeacherMeetings.studentId }),
    medicalRecord: r.one.medicalRecords({ from: r.studentProfiles.id, to: r.medicalRecords.studentId }),
  },
  subjects: {
    marks: r.many.marks({ from: r.subjects.id, to: r.marks.subjectId }),
  },
  attendance: {
    student: r.one.studentProfiles({ from: r.attendance.studentId, to: r.studentProfiles.id, optional: false }),
    class: r.one.classes({ from: r.attendance.classId, to: r.classes.id, optional: false }),
  },
  marks: {
    student: r.one.studentProfiles({ from: r.marks.studentId, to: r.studentProfiles.id, optional: false }),
    subject: r.one.subjects({ from: r.marks.subjectId, to: r.subjects.id, optional: false }),
  },
  feeInvoices: {
    student: r.one.studentProfiles({ from: r.feeInvoices.studentId, to: r.studentProfiles.id, optional: false }),
  },
  notifications: {
    user: r.one.users({ from: r.notifications.userId, to: r.users.id, optional: false }),
  },
  badges: {
    student: r.one.studentProfiles({ from: r.badges.studentId, to: r.studentProfiles.id, optional: false }),
  },
  disciplinaryRecords: {
    student: r.one.studentProfiles({ from: r.disciplinaryRecords.studentId, to: r.studentProfiles.id, optional: false }),
  },
  leaveRequests: {
    teacher: r.one.teacherProfiles({ from: r.leaveRequests.teacherId, to: r.teacherProfiles.id, optional: false }),
  },
  lessonPlans: {
    teacher: r.one.teacherProfiles({ from: r.lessonPlans.teacherId, to: r.teacherProfiles.id, optional: false }),
  },
  cafeteriaOrders: {
    student: r.one.studentProfiles({ from: r.cafeteriaOrders.studentId, to: r.studentProfiles.id, optional: false }),
  },
  syllabi: {
    teacher: r.one.teacherProfiles({ from: r.syllabi.teacherId, to: r.teacherProfiles.id, optional: false }),
  },
  assignmentSubmissions: {
    student: r.one.studentProfiles({ from: r.assignmentSubmissions.studentId, to: r.studentProfiles.id, optional: false }),
  },
  quizzes: {
    teacher: r.one.teacherProfiles({ from: r.quizzes.teacherId, to: r.teacherProfiles.id, optional: false }),
    class: r.one.classes({ from: r.quizzes.classId, to: r.classes.id, optional: false }),
    questions: r.many.questions({ from: r.quizzes.id, to: r.questions.quizId }),
  },
  questions: {
    quiz: r.one.quizzes({ from: r.questions.quizId, to: r.quizzes.id, optional: false }),
  },
  books: {
    checkouts: r.many.bookCheckouts({ from: r.books.id, to: r.bookCheckouts.bookId }),
  },
  bookCheckouts: {
    book: r.one.books({ from: r.bookCheckouts.bookId, to: r.books.id, optional: false }),
    student: r.one.studentProfiles({ from: r.bookCheckouts.studentId, to: r.studentProfiles.id, optional: false }),
  },
  biometricLogs: {
    student: r.one.studentProfiles({ from: r.biometricLogs.studentId, to: r.studentProfiles.id, optional: false }),
  },
  disciplinaryIncidents: {
    student: r.one.studentProfiles({ from: r.disciplinaryIncidents.studentId, to: r.studentProfiles.id, optional: false }),
    teacher: r.one.teacherProfiles({ from: r.disciplinaryIncidents.teacherId, to: r.teacherProfiles.id, optional: false }),
  },
  parentTeacherMeetings: {
    parent: r.one.parentProfiles({ from: r.parentTeacherMeetings.parentId, to: r.parentProfiles.id, optional: false }),
    teacher: r.one.teacherProfiles({ from: r.parentTeacherMeetings.teacherId, to: r.teacherProfiles.id, optional: false }),
    student: r.one.studentProfiles({ from: r.parentTeacherMeetings.studentId, to: r.studentProfiles.id, optional: false }),
  },
  appPackages: {
    instances: r.many.appInstances({ from: r.appPackages.id, to: r.appInstances.packageId }),
  },
  appInstances: {
    package: r.one.appPackages({ from: r.appInstances.packageId, to: r.appPackages.id, optional: false }),
  },
  medicalRecords: {
    student: r.one.studentProfiles({ from: r.medicalRecords.studentId, to: r.studentProfiles.id, optional: false }),
  },
  resourceRequisitions: {
    teacher: r.one.teacherProfiles({ from: r.resourceRequisitions.teacherId, to: r.teacherProfiles.id, optional: false }),
  },
  professionalDevelopments: {
    teacher: r.one.teacherProfiles({ from: r.professionalDevelopments.teacherId, to: r.teacherProfiles.id, optional: false }),
  },
  announcements: {
    feedback: r.many.announcementFeedback({ from: r.announcements.id, to: r.announcementFeedback.announcementId }),
  },
  announcementFeedback: {
    announcement: r.one.announcements({ from: r.announcementFeedback.announcementId, to: r.announcements.id, optional: false }),
    user: r.one.users({ from: r.announcementFeedback.userId, to: r.users.id, optional: false }),
  },
}));
