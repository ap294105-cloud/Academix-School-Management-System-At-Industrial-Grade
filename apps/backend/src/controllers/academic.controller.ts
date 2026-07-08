import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

export async function getClasses(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'ADMIN') {
      const classes = await prisma.class.findMany({
        include: {
          teacher: { include: { user: true } },
          _count: { select: { students: true } }
        }
      });
      return res.json(classes);
    } else if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: user.id }
      });
      if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

      const classes = await prisma.class.findMany({
        where: { teacherId: teacher.id },
        include: {
          _count: { select: { students: true } }
        }
      });
      return res.json(classes);
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getClassStudents(req: AuthRequest, res: Response) {
  const { classId } = req.params;

  try {
    const students = await prisma.studentProfile.findMany({
      where: { classId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        attendance: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        marks: {
          include: { subject: true }
        }
      }
    });

    return res.json(students);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function markAttendance(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { classId, date, attendanceRecords } = req.body; 

  if (!classId || !date || !Array.isArray(attendanceRecords)) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const formattedDate = new Date(date);

    const operations = attendanceRecords.map(record => {
      return prisma.attendance.create({
        data: {
          studentId: record.studentId,
          classId: classId,
          date: formattedDate,
          status: record.status,
          remarks: record.remarks,
        }
      });
    });

    await prisma.$transaction(operations);

    const absents = attendanceRecords.filter(r => r.status === 'ABSENT');
    for (const record of absents) {
      const student = await prisma.studentProfile.findUnique({
        where: { id: record.studentId },
        include: {
          user: true,
          parent: { include: { user: true } }
        }
      });
      if (student && student.parent) {
        await prisma.notification.create({
          data: {
            userId: student.parent.userId,
            title: 'Attendance Alert: Absent',
            message: `${student.user.name} was marked ABSENT today (${date}).`,
          }
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'MARK_ATTENDANCE',
        performedBy: user.email,
        details: `Marked attendance for class ${classId} on ${date}. Total records: ${attendanceRecords.length}`,
      }
    });

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function submitMark(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { studentId, subjectId, examType, score, maxScore } = req.body;

  if (!studentId || !subjectId || !examType || score === undefined || !maxScore) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const mark = await prisma.mark.create({
      data: {
        studentId,
        subjectId,
        examType,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        date: new Date(),
      },
      include: {
        student: { include: { user: true } },
        subject: true,
      }
    });

    await prisma.notification.create({
      data: {
        userId: mark.student.userId,
        title: 'New Score Posted',
        message: `Your score for ${mark.subject.name} (${examType}) has been uploaded: ${score}/${maxScore}.`,
      }
    });

    if (mark.student.parentId) {
      const parent = await prisma.parentProfile.findUnique({
        where: { id: mark.student.parentId }
      });
      if (parent) {
        await prisma.notification.create({
          data: {
            userId: parent.userId,
            title: 'Child Score Update',
            message: `New score for ${mark.student.user.name} in ${mark.subject.name} (${examType}): ${score}/${maxScore}.`,
          }
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'SUBMIT_MARK',
        performedBy: user.email,
        details: `Submitted score for student ${mark.student.user.name}: ${score}/${maxScore} in ${mark.subject.name}`,
      }
    });

    return res.json(mark);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getSubjects(req: Request, res: Response) {
  try {
    const subjects = await prisma.subject.findMany();
    return res.json(subjects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
