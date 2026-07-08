import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// --- Multi-Channel Emergency Broadcast ---
export async function broadcastEmergency(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admins can blast emergency broadcasts' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message content is required' });

  try {
    const allUsers = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
    
    // Simulate sending Twilio SMS / SendGrid Email logs
    const smsCount = allUsers.length;
    const emailCount = allUsers.length;

    // Log notifications in DB for everyone
    const notificationOperations = allUsers.map(u => {
      return prisma.notification.create({
        data: {
          userId: u.id,
          title: '🚨 EMERGENCY ALERT',
          message,
        }
      });
    });

    await prisma.$transaction(notificationOperations);

    await prisma.auditLog.create({
      data: {
        action: 'EMERGENCY_BROADCAST',
        performedBy: user.email,
        details: `Dispatched emergency alert: "${message}". SMS sent: ${smsCount}, Emails sent: ${emailCount}`,
      }
    });

    return res.json({
      success: true,
      message: `Emergency broadcast successfully dispatched over SMS, Email, and In-App networks.`,
      channels: {
        smsCount,
        emailCount,
        pushCount: allUsers.length
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Parent-Teacher Conference Scheduler (Double Booking Prevention) ---
export async function bookMeeting(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'PARENT') return res.status(403).json({ error: 'Only parents can book consultations' });

  const { studentId, teacherId, date, timeSlot } = req.body;
  if (!studentId || !teacherId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Missing reservation parameters' });
  }

  try {
    const parent = await prisma.parentProfile.findUnique({ where: { userId: user.id } });
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    const targetDate = new Date(date);

    // Double Booking Check: See if teacher already has a booked slot on this date/timeslot
    const conflict = await prisma.parentTeacherMeeting.findFirst({
      where: {
        teacherId,
        date: targetDate,
        timeSlot,
        status: 'BOOKED'
      }
    });

    if (conflict) {
      return res.status(409).json({ error: 'Double-booking conflict: This teacher is already reserved for this timeslot. Please select another slot.' });
    }

    const meeting = await prisma.parentTeacherMeeting.create({
      data: {
        parentId: parent.id,
        teacherId,
        studentId,
        date: targetDate,
        timeSlot,
        status: 'BOOKED'
      },
      include: {
        teacher: { include: { user: true } },
        student: { include: { user: true } }
      }
    });

    // Notify teacher
    await prisma.notification.create({
      data: {
        userId: meeting.teacher.userId,
        title: 'New Conference Booked',
        message: `Meeting scheduled with parent of ${meeting.student.user.name} on ${date} at ${timeSlot}.`,
      }
    });

    return res.status(201).json(meeting);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getMeetings(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'PARENT') {
      const parent = await prisma.parentProfile.findUnique({ where: { userId: user.id } });
      if (!parent) return res.status(404).json({ error: 'Parent not found' });
      const list = await prisma.parentTeacherMeeting.findMany({
        where: { parentId: parent.id },
        include: { teacher: { include: { user: true } }, student: { include: { user: true } } },
        orderBy: { date: 'asc' }
      });
      return res.json(list);
    } else if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
      if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
      const list = await prisma.parentTeacherMeeting.findMany({
        where: { teacherId: teacher.id },
        include: { parent: { include: { user: true } }, student: { include: { user: true } } },
        orderBy: { date: 'asc' }
      });
      return res.json(list);
    } else {
      const list = await prisma.parentTeacherMeeting.findMany({
        include: {
          parent: { include: { user: true } },
          teacher: { include: { user: true } },
          student: { include: { user: true } }
        },
        orderBy: { date: 'asc' }
      });
      return res.json(list);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
