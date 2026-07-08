import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// ==========================================
// 1. DYNAMIC MULTI-TIER INVOICE GENERATOR
// ==========================================
export async function createStudentInvoice(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied: Administrator credentials required' });

  const { studentId, description, amount, dueDate } = req.body;
  if (!studentId || !description || !amount) {
    return res.status(400).json({ error: 'studentId, description, and amount are required' });
  }

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const invoice = await prisma.feeInvoice.create({
      data: {
        studentId,
        description,
        amount: parseFloat(amount),
        status: 'UNPAID',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // default 30 days
      }
    });

    // Log to Audit trail
    await prisma.auditLog.create({
      data: {
        action: 'INVOICE_GENERATED',
        performedBy: user.email,
        details: `Billed student ${student.user.name}: "${description}" for $${amount}`
      }
    });

    return res.json({ success: true, invoice });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ==========================================
// 2. FINANCIAL BALANCE WAIVER DESK
// ==========================================
export async function applyFeeWaiver(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied: Administrator credentials required' });

  const { studentId, amount, reason } = req.body;
  if (!studentId || !amount || !reason) {
    return res.status(400).json({ error: 'studentId, amount, and reason are required' });
  }

  const waiveVal = parseFloat(amount);
  if (waiveVal <= 0) return res.status(400).json({ error: 'Waiver value must be positive' });

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Fetch unpaid or overdue invoices
    const invoices = await prisma.feeInvoice.findMany({
      where: {
        studentId,
        status: { in: ['UNPAID', 'OVERDUE'] }
      },
      orderBy: { dueDate: 'asc' }
    });

    if (invoices.length === 0) {
      return res.status(400).json({ error: 'No active outstanding billings found for this student.' });
    }

    let remainingWaiver = waiveVal;
    let waivedCount = 0;

    for (const inv of invoices) {
      if (remainingWaiver <= 0) break;

      if (inv.amount <= remainingWaiver) {
        remainingWaiver -= inv.amount;
        // Mark invoice fully paid/waived
        await prisma.feeInvoice.update({
          where: { id: inv.id },
          data: { amount: 0, status: 'PAID', paidAt: new Date(), transactionId: `WAIVE-${Date.now().toString().slice(-6)}` }
        });
      } else {
        // Partially waive invoice
        const nextAmount = inv.amount - remainingWaiver;
        remainingWaiver = 0;
        await prisma.feeInvoice.update({
          where: { id: inv.id },
          data: { amount: nextAmount }
        });
      }
      waivedCount++;
    }

    // Log to Audit trail
    await prisma.auditLog.create({
      data: {
        action: 'FEE_WAIVER_APPLIED',
        performedBy: user.email,
        details: `Waived $${waiveVal} for student ${student.user.name}. Reason: "${reason}". Applied to ${waivedCount} billings.`
      }
    });

    return res.json({
      success: true,
      message: `Successfully applied $${waiveVal} fee waiver. Oldest outstanding invoices updated.`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
