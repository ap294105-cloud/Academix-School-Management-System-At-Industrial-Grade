export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  subjects: string[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  admissionNo: string;
  className: string;
  section: string;
  parentId?: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  phone: string;
  students: string[]; // IDs of student profiles
}

export interface Class {
  id: string;
  name: string;
  section: string;
  teacherId: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks?: string;
}

export interface Mark {
  id: string;
  studentId: string;
  subjectId: string;
  examType: 'QUIZ' | 'MIDTERM' | 'FINAL' | 'ASSIGNMENT';
  score: number;
  maxScore: number;
  date: string;
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  paidAt?: string;
  transactionId?: string;
  description: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
