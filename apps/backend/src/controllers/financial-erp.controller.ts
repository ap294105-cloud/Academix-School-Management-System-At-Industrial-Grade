import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// --- Multi-Tier Fee Invoicing ---
export async function createFeeInvoice(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

  const { studentId, tuition, transport, cafeteria, description } = req.body;
  if (!studentId || !tuition) return res.status(400).json({ error: 'Student ID and Tuition fee amount are required' });

  try {
    const totalAmount = parseFloat(tuition) + (parseFloat(transport) || 0) + (parseFloat(cafeteria) || 0);

    const invoice = await prisma.feeInvoice.create({
      data: {
        studentId,
        amount: totalAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // due in 30 days
        status: 'UNPAID',
        description: description || 'Consolidated Fees Statement (Tuition, Transit, Cafeteria)',
      }
    });

    return res.json(invoice);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Dynamic Payroll & Tax Calculator ---
export async function getSalaryPayslip(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let employeeName = user.name;
    let basePay = 4500.0;
    let substituteHours = 8;
    let ratePerHour = 35.0;

    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
        include: { user: true }
      });
      if (teacher) {
        employeeName = teacher.user.name;
        basePay = teacher.department === 'Mathematics' ? 4800.0 : 4500.0;
      }
    } else if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Faculty role required for payroll access' });
    }

    const overtimeSalary = substituteHours * ratePerHour;
    const grossPay = basePay + overtimeSalary;
    const taxDeductions = parseFloat((grossPay * 0.15).toFixed(2)); // 15% flat tax deduction
    const netSalary = grossPay - taxDeductions;

    return res.json({
      employeeName,
      basePay,
      substituteHours,
      ratePerHour,
      overtimeSalary,
      grossPay,
      taxDeductions,
      netSalary,
      payPeriod: 'June 2026',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Asset Depreciation Tracker ---
export async function getAssetInventory(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

  try {
    const assets = await prisma.asset.findMany();
    
    // Calculate depreciation dynamically based on purchase date and rate
    const calculatedAssets = assets.map(asset => {
      const purchaseYear = new Date(asset.purchaseDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearsElapsed = Math.max(0, currentYear - purchaseYear);
      
      // Declining balance depreciation math: current_value = cost * (1 - rate)^years
      const currentValue = parseFloat(
        (asset.cost * Math.pow(1 - asset.depreciationRate, yearsElapsed)).toFixed(2)
      );

      return {
        ...asset,
        yearsElapsed,
        currentValue,
        accumulatedDepreciation: parseFloat((asset.cost - currentValue).toFixed(2)),
      };
    });

    return res.json(calculatedAssets);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Vendor Bidding & Procurement ---
export async function submitProcurementQuote(req: Request, res: Response) {
  const { vendorName, particulars, amount } = req.body;
  if (!vendorName || !particulars || !amount) {
    return res.status(400).json({ error: 'Missing quotation details' });
  }

  try {
    const quote = await prisma.procurementQuote.create({
      data: {
        vendorName,
        particulars,
        amount: parseFloat(amount),
        status: 'PENDING',
      }
    });
    return res.status(201).json(quote);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getProcurementQuotes(req: AuthRequest, res: Response) {
  try {
    const list = await prisma.procurementQuote.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateQuoteStatus(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin permission required' });

  const { id } = req.params;
  const { status } = req.body; // APPROVED or REJECTED

  try {
    const quote = await prisma.procurementQuote.update({
      where: { id },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        action: 'REVIEW_QUOTE',
        performedBy: user.email,
        details: `Procurement quote from ${quote.vendorName} was ${status.toLowerCase()}`,
      }
    });

    return res.json(quote);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
