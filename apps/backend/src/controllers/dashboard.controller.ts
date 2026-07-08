import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (user.role === 'ADMIN') {
      const studentCount = await prisma.studentProfile.count();
      const teacherCount = await prisma.teacherProfile.count();
      const parentCount = await prisma.parentProfile.count();
      const classCount = await prisma.class.count();

      const paidFees = await prisma.feeInvoice.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      });
      const unpaidFees = await prisma.feeInvoice.aggregate({
        where: { status: { in: ['UNPAID', 'OVERDUE'] } },
        _sum: { amount: true },
      });

      const recentLogs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5,
      });

      const recentPayments = await prisma.feeInvoice.findMany({
        where: { status: 'PAID' },
        orderBy: { paidAt: 'desc' },
        take: 5,
        include: {
          student: {
            include: { user: true }
          }
        }
      });

      return res.json({
        role: 'ADMIN',
        stats: {
          students: studentCount,
          teachers: teacherCount,
          parents: parentCount,
          classes: classCount,
          feesCollected: paidFees._sum.amount || 0,
          feesOutstanding: unpaidFees._sum.amount || 0,
        },
        recentLogs,
        recentPayments,
      });
    }

    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
        include: {
          classes: {
            include: {
              students: {
                include: { user: true }
              }
            }
          }
        }
      });

      if (!teacher) {
        return res.status(404).json({ error: 'Teacher profile not found' });
      }

      const studentCount = teacher.classes.reduce((sum, c) => sum + c.students.length, 0);
      const studentIds = teacher.classes.flatMap(c => c.students.map(s => s.id));
      const recentMarks = await prisma.mark.findMany({
        where: { studentId: { in: studentIds } },
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          student: { include: { user: true } },
          subject: true,
        }
      });

      return res.json({
        role: 'TEACHER',
        profile: {
          id: teacher.id,
          employeeId: teacher.employeeId,
          department: teacher.department,
        },
        classes: teacher.classes.map(c => ({
          id: c.id,
          name: c.name,
          section: c.section,
          studentCount: c.students.length,
        })),
        stats: {
          totalStudents: studentCount,
          totalClasses: teacher.classes.length,
        },
        recentMarks,
      });
    }

    if (user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: {
          class: {
            include: { teacher: { include: { user: true } } }
          }
        }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      const attendance = await prisma.attendance.findMany({
        where: { studentId: student.id },
      });
      const totalAttendance = attendance.length;
      const presentCount = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 100;

      const marks = await prisma.mark.findMany({
        where: { studentId: student.id },
        include: { subject: true },
        orderBy: { date: 'desc' },
      });

      const feeInvoices = await prisma.feeInvoice.findMany({
        where: { studentId: student.id },
        orderBy: { dueDate: 'asc' },
      });

      return res.json({
        role: 'STUDENT',
        profile: {
          id: student.id,
          admissionNo: student.admissionNo,
          class: student.class ? `${student.class.name} - ${student.class.section}` : 'Unassigned',
          classTeacher: student.class?.teacher?.user.name || 'Unassigned',
        },
        stats: {
          attendanceRate: Math.round(attendanceRate),
          unpaidInvoicesCount: feeInvoices.filter(i => i.status !== 'PAID').length,
          recentGrade: marks[0]?.score ? `${marks[0].score}/${marks[0].maxScore}` : 'N/A',
        },
        attendance,
        marks,
        feeInvoices,
      });
    }

    if (user.role === 'PARENT') {
      const parent = await prisma.parentProfile.findUnique({
        where: { userId: user.id },
        include: {
          students: {
            include: {
              user: true,
              class: true,
              attendance: true,
              marks: { include: { subject: true } },
              feeInvoices: true,
            }
          }
        }
      });

      if (!parent) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }

      const childrenData = parent.students.map(s => {
        const totalAtt = s.attendance.length;
        const presentAtt = s.attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const attRate = totalAtt > 0 ? (presentAtt / totalAtt) * 100 : 100;

        const outstandingFees = s.feeInvoices
          .filter(f => f.status !== 'PAID')
          .reduce((sum, f) => sum + f.amount, 0);

        return {
          id: s.id,
          name: s.user.name,
          admissionNo: s.admissionNo,
          class: s.class ? `${s.class.name} - ${s.class.section}` : 'Unassigned',
          attendanceRate: Math.round(attRate),
          outstandingFees,
          marks: s.marks.map(m => ({
            id: m.id,
            subject: m.subject.name,
            examType: m.examType,
            score: m.score,
            maxScore: m.maxScore,
            date: m.date,
          })),
          feeInvoices: s.feeInvoices,
        };
      });

      return res.json({
        role: 'PARENT',
        profile: {
          id: parent.id,
          phone: parent.phone,
        },
        children: childrenData,
      });
    }

    return res.status(400).json({ error: 'Invalid user role' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
