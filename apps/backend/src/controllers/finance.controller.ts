import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

export async function getStudentInvoices(req: AuthRequest, res: Response) {
  const { studentId } = req.params;

  try {
    const invoices = await prisma.feeInvoice.findMany({
      where: { studentId },
      orderBy: { dueDate: 'asc' },
    });
    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function payInvoice(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ error: 'Invoice ID is required' });
  }

  try {
    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId },
      include: { student: { include: { user: true } } },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Invoice is already paid' });
    }

    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const updatedInvoice = await prisma.feeInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        transactionId,
      },
    });

    await prisma.notification.create({
      data: {
        userId: invoice.student.userId,
        title: 'Payment Successful',
        message: `Your payment of $${invoice.amount} for ${invoice.description} was processed successfully (Txn: ${transactionId}).`,
      }
    });

    if (invoice.student.parentId) {
      const parent = await prisma.parentProfile.findUnique({
        where: { id: invoice.student.parentId }
      });
      if (parent) {
        await prisma.notification.create({
          data: {
            userId: parent.userId,
            title: 'Payment Successful',
            message: `Fee payment of $${invoice.amount} for student ${invoice.student.user.name} processed successfully (Txn: ${transactionId}).`,
          }
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'PAY_FEE',
        performedBy: user.email,
        details: `Processed payment of $${invoice.amount} for Invoice ID ${invoice.id}. Txn: ${transactionId}`,
      }
    });

    return res.json(updatedInvoice);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getFinancialSummary(req: AuthRequest, res: Response) {
  try {
    const totalBilled = await prisma.feeInvoice.aggregate({ _sum: { amount: true } });
    const totalPaid = await prisma.feeInvoice.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } });
    const totalUnpaid = await prisma.feeInvoice.aggregate({ where: { status: 'UNPAID' }, _sum: { amount: true } });
    const totalOverdue = await prisma.feeInvoice.aggregate({ where: { status: 'OVERDUE' }, _sum: { amount: true } });

    const allInvoices = await prisma.feeInvoice.findMany({
      include: { student: { include: { user: true } } },
      orderBy: { dueDate: 'desc' },
      take: 20
    });

    return res.json({
      summary: {
        billed: totalBilled._sum.amount || 0,
        paid: totalPaid._sum.amount || 0,
        unpaid: totalUnpaid._sum.amount || 0,
        overdue: totalOverdue._sum.amount || 0,
      },
      invoices: allInvoices,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
