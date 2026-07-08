import express from 'express';
import cors from 'cors';
import { authenticate, requireRole } from './middleware/auth';
import { login, getCurrentUser } from './controllers/auth.controller';
import { getDashboardStats } from './controllers/dashboard.controller';
import { getClasses, getClassStudents, markAttendance, submitMark, getSubjects } from './controllers/academic.controller';
import { getStudentInvoices, payInvoice, getFinancialSummary } from './controllers/finance.controller';
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
  getLessonPlans,
  createLessonPlan,

  getMaintenanceTickets,
  createMaintenanceTicket,
  updateMaintenanceStatus,
  getCafeteriaOrders,
  createCafeteriaOrder,
  getEvents,
  getExpenses,
  createExpense
} from './controllers/enterprise.controller';

import {
  createSyllabus,
  getSyllabi,
  scanPlagiarism,
  getSubmissions,
  getLearningPath
} from './controllers/academic-lms.controller';

import {
  createFeeInvoice,
  getSalaryPayslip,
  getAssetInventory,
  submitProcurementQuote,
  getProcurementQuotes,
  updateQuoteStatus
} from './controllers/financial-erp.controller';

import {
  uploadBiometricCSV,
  getBiometricLogs,
  createDisciplinaryIncident,
  getDisciplinaryIncidents,
  updateIncidentStatus,
  getIoTMetersData
} from './controllers/infrastructure.controller';

import {
  broadcastEmergency,
  bookMeeting,
  getMeetings
} from './controllers/comms.controller';

import {
  getPackages,
  installPackage,
  uninstallPackage,
  saveInstanceConfig,
  createAppFromPrompt
} from './controllers/appstore.controller';

import {
  executeAICommand,
  auditTelemetryAnomalies
} from './controllers/aidirector.controller';

import {
  getMedicalRecord,
  saveMedicalRecord,
  getRequisitions,
  createRequisition,
  updateRequisitionStatus,
  getDevelopmentCredits,
  addDevelopmentCredit
} from './controllers/phase2.controller';

import {
  getRbacPolicies,
  updateRbacPolicies,
  getAnnouncements,
  createAnnouncement,
  postAnnouncementFeedback
} from './controllers/phase3.controller';

import {
  getQuizzes,
  createQuiz,
  submitQuizAnswers,
  getLibraryBooks,
  checkoutBook,
  returnBook
} from './controllers/phase4.controller';

import prisma from './utils/db';

import {
  applyFeeWaiver
} from './controllers/phase7.controller';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Public Routes
app.post('/api/auth/login', login);
app.post('/api/finance/procurement/quote', submitProcurementQuote); // public quote bidding

// Authenticated Routes
app.get('/api/auth/me', authenticate, getCurrentUser);
app.get('/api/dashboard/stats', authenticate, getDashboardStats);

// Academic Routes (Base)
app.get('/api/academics/classes', authenticate, requireRole(['ADMIN', 'TEACHER']), getClasses);
app.get('/api/academics/classes/:classId/students', authenticate, requireRole(['ADMIN', 'TEACHER']), getClassStudents);
app.post('/api/academics/attendance', authenticate, requireRole(['ADMIN', 'TEACHER']), markAttendance);
app.post('/api/academics/marks', authenticate, requireRole(['ADMIN', 'TEACHER']), submitMark);
app.get('/api/academics/subjects', authenticate, getSubjects);

// Finance Routes (Base)
app.get('/api/finance/student/:studentId/invoices', authenticate, requireRole(['ADMIN', 'STUDENT', 'PARENT']), getStudentInvoices);
app.post('/api/finance/pay', authenticate, requireRole(['ADMIN', 'PARENT']), payInvoice);
app.get('/api/finance/summary', authenticate, requireRole(['ADMIN']), getFinancialSummary);

// Enterprise Routes
app.get('/api/enterprise/leaves', authenticate, getLeaveRequests);
app.post('/api/enterprise/leaves', authenticate, createLeaveRequest);
app.patch('/api/enterprise/leaves/:id', authenticate, updateLeaveStatus);

app.get('/api/enterprise/lessons', authenticate, getLessonPlans);
app.post('/api/enterprise/lessons', authenticate, createLessonPlan);

app.get('/api/enterprise/maintenance', authenticate, getMaintenanceTickets);
app.post('/api/enterprise/maintenance', authenticate, createMaintenanceTicket);
app.patch('/api/enterprise/maintenance/:id', authenticate, updateMaintenanceStatus);

app.get('/api/enterprise/cafeteria', authenticate, getCafeteriaOrders);
app.post('/api/enterprise/cafeteria', authenticate, createCafeteriaOrder);

app.get('/api/enterprise/events', authenticate, getEvents);

app.get('/api/enterprise/expenses', authenticate, getExpenses);
app.post('/api/enterprise/expenses', authenticate, createExpense);

// Domain 1: Academic LMS Extended Routes
app.post('/api/academic/syllabus', authenticate, createSyllabus);
app.get('/api/academic/syllabus', authenticate, getSyllabi);
app.post('/api/academic/plagiarism', authenticate, scanPlagiarism);
app.get('/api/academic/plagiarism', authenticate, getSubmissions);
app.get('/api/academic/learning-path', authenticate, getLearningPath);

// Domain 2: Financial ERP Extended Routes
app.post('/api/finance/invoices', authenticate, createFeeInvoice);
app.post('/api/finance/waivers', authenticate, applyFeeWaiver);
app.get('/api/finance/payroll', authenticate, getSalaryPayslip);
app.get('/api/finance/assets', authenticate, getAssetInventory);
app.get('/api/finance/procurement', authenticate, getProcurementQuotes);
app.patch('/api/finance/procurement/:id', authenticate, updateQuoteStatus);

// Domain 3: Infrastructure Extended Routes
app.post('/api/infrastructure/biometrics', authenticate, uploadBiometricCSV);
app.get('/api/infrastructure/biometrics', authenticate, getBiometricLogs);
app.post('/api/infrastructure/incidents', authenticate, createDisciplinaryIncident);
app.get('/api/infrastructure/incidents', authenticate, getDisciplinaryIncidents);
app.patch('/api/infrastructure/incidents/:id', authenticate, updateIncidentStatus);
app.get('/api/infrastructure/iot', getIoTMetersData);

// Domain 4: Communications Extended Routes
app.post('/api/comms/broadcast', authenticate, broadcastEmergency);
app.post('/api/comms/meetings', authenticate, bookMeeting);
app.get('/api/comms/meetings', authenticate, getMeetings);

// AppStore / Dynamic Feature SDK Routes
app.get('/api/appstore/packages', authenticate, getPackages);
app.post('/api/appstore/install/:id', authenticate, installPackage);
app.post('/api/appstore/uninstall/:id', authenticate, uninstallPackage);
app.post('/api/appstore/instance/config', authenticate, saveInstanceConfig);
app.post('/api/appstore/compile', authenticate, createAppFromPrompt);

// AI Director / Autonomous Operations Routes
app.post('/api/ai/execute', authenticate, executeAICommand);
app.post('/api/ai/audit', authenticate, auditTelemetryAnomalies);

// Phase 2: Extended Healthcare, Logistics & Professional Development Routes
app.get('/api/medical/:studentId', authenticate, getMedicalRecord);
app.post('/api/medical', authenticate, saveMedicalRecord);
app.get('/api/logistics/requisitions', authenticate, getRequisitions);
app.post('/api/logistics/requisitions', authenticate, createRequisition);
app.patch('/api/logistics/requisitions/:id', authenticate, updateRequisitionStatus);
app.get('/api/faculty/development/:teacherId', authenticate, getDevelopmentCredits);
app.post('/api/faculty/development', authenticate, addDevelopmentCredit);

// Phase 3: Dynamic RBAC Security & Community Announcements Routes
app.get('/api/security/rbac', authenticate, getRbacPolicies);
app.post('/api/security/rbac', authenticate, updateRbacPolicies);
app.get('/api/comms/announcements', authenticate, getAnnouncements);
app.post('/api/comms/announcements', authenticate, createAnnouncement);
app.post('/api/comms/announcements/:id/feedback', authenticate, postAnnouncementFeedback);

// Phase 4: Assessment Quizzes & E-Book Library Checkout Routes
app.get('/api/academics/quizzes', authenticate, getQuizzes);
app.post('/api/academics/quizzes', authenticate, createQuiz);
app.post('/api/academics/quizzes/:id/submit', authenticate, submitQuizAnswers);
app.get('/api/library/books', authenticate, getLibraryBooks);
app.post('/api/library/checkout', authenticate, checkoutBook);
app.post('/api/library/return', authenticate, returnBook);

// Notification Routes
app.get('/api/notifications', authenticate, async (req: any, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/:id/read', authenticate, async (req: any, res) => {
  const { id } = req.params;
  try {
    const notif = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(notif);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SMS-BACKEND] Server listening on http://localhost:${PORT}`);
});
