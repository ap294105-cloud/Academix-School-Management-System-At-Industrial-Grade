import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// --- Faculty HR / Leaves ---
export async function getLeaveRequests(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'ADMIN') {
      const leaves = await prisma.leaveRequest.findMany({
        include: { teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(leaves);
    } else if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
      if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

      const leaves = await prisma.leaveRequest.findMany({
        where: { teacherId: teacher.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(leaves);
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createLeaveRequest(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can request leaves' });

  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate || !reason) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const request = await prisma.leaveRequest.create({
      data: {
        teacherId: teacher.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
      }
    });

    // Notify administrators
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Leave Application',
          message: `${user.name} submitted a leave request: "${reason}"`,
        }
      });
    }

    return res.json(request);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateLeaveStatus(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admins can review leaves' });

  const { id } = req.params;
  const { status } = req.body; // APPROVED or REJECTED

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
      include: { teacher: { include: { user: true } } }
    });

    // Notify teacher
    await prisma.notification.create({
      data: {
        userId: leave.teacher.userId,
        title: `Leave Request: ${status}`,
        message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been ${status.toLowerCase()}.`,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'REVIEW_LEAVE',
        performedBy: user.email,
        details: `Leave request for ${leave.teacher.user.name} was ${status.toLowerCase()}`,
      }
    });

    return res.json(leave);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Academics / Lesson Planning ---
export async function getLessonPlans(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'ADMIN') {
      const plans = await prisma.lessonPlan.findMany({
        include: { teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(plans);
    } else if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
      if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

      const plans = await prisma.lessonPlan.findMany({
        where: { teacherId: teacher.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(plans);
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createLessonPlan(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can write plans' });

  const { title, content, className, subjectName } = req.body;
  if (!title || !content || !className || !subjectName) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const plan = await prisma.lessonPlan.create({
      data: {
        teacherId: teacher.id,
        title,
        content,
        className,
        subjectName,
      }
    });

    return res.json(plan);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Operations / Facilities & Maintenance ---
export async function getMaintenanceTickets(req: AuthRequest, res: Response) {
  try {
    const tickets = await prisma.maintenanceTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(tickets);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createMaintenanceTicket(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, description, location } = req.body;
  if (!title || !description || !location) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const ticket = await prisma.maintenanceTicket.create({
      data: {
        title,
        description,
        location,
        status: 'PENDING',
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_MAINTENANCE',
        performedBy: user.email,
        details: `Created maintenance ticket: "${title}" at ${location}`,
      }
    });

    return res.json(ticket);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateMaintenanceStatus(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admins can review facility tickets' });

  const { id } = req.params;
  const { status } = req.body; // PENDING, IN_PROGRESS, RESOLVED

  if (!status || !['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const ticket = await prisma.maintenanceTicket.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_MAINTENANCE',
        performedBy: user.email,
        details: `Updated maintenance ticket status to ${status.toLowerCase()} for "${ticket.title}"`,
      }
    });

    return res.json(ticket);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Logistics / Cafeteria Ordering ---
export async function getCafeteriaOrders(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'ADMIN') {
      const orders = await prisma.cafeteriaOrder.findMany({
        include: { student: { include: { user: true } } },
        orderBy: { orderDate: 'desc' }
      });
      return res.json(orders);
    } else if (user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!student) return res.status(404).json({ error: 'Student profile not found' });

      const orders = await prisma.cafeteriaOrder.findMany({
        where: { studentId: student.id },
        orderBy: { orderDate: 'desc' }
      });
      return res.json(orders);
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createCafeteriaOrder(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can pre-order lunch' });

  const { itemNames, totalPrice } = req.body;
  if (!itemNames || !totalPrice) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const order = await prisma.cafeteriaOrder.create({
      data: {
        studentId: student.id,
        itemNames,
        totalPrice: parseFloat(totalPrice),
        status: 'ORDERED',
      }
    });

    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Community / Event Calendar ---
export async function getEvents(req: Request, res: Response) {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'asc' }
    });
    return res.json(events);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Finance / Accounting Expenses ---
export async function getExpenses(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admins can review ledger expenses' });

  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    return res.json(expenses);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createExpense(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admins can record expenses' });

  const { amount, category, description } = req.body;
  if (!amount || !category || !description) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        description,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_EXPENSE',
        performedBy: user.email,
        details: `Recorded expense of $${amount} for ${category}: "${description}"`,
      }
    });

    return res.json(expense);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
