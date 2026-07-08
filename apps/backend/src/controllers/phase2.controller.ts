import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// ==========================================
// 1. MEDICAL HEALTH RECORDS
// ==========================================
export async function getMedicalRecord(req: AuthRequest, res: Response) {
  const { studentId } = req.params;
  try {
    let record = await prisma.medicalRecord.findUnique({
      where: { studentId }
    });

    if (!record) {
      // Return a blank structure rather than 404 so UI can easily fill it in
      return res.json({
        studentId,
        allergies: 'None reported',
        medicalHistory: 'No chronic condition registry',
        immunizationChecks: JSON.stringify({
          MMR: 'CHECKED',
          DTaP: 'CHECKED',
          Polio: 'CHECKED',
          HepB: 'CHECKED',
          Varicella: 'PENDING'
        })
      });
    }

    return res.json(record);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function saveMedicalRecord(req: AuthRequest, res: Response) {
  const { studentId, allergies, medicalHistory, immunizationChecks } = req.body;
  if (!studentId) return res.status(400).json({ error: 'studentId is required' });

  try {
    const record = await prisma.medicalRecord.upsert({
      where: { studentId },
      update: {
        allergies: allergies || 'None reported',
        medicalHistory: medicalHistory || 'No chronic condition registry',
        immunizationChecks: immunizationChecks || '{}'
      },
      create: {
        studentId,
        allergies: allergies || 'None reported',
        medicalHistory: medicalHistory || 'No chronic condition registry',
        immunizationChecks: immunizationChecks || '{}'
      }
    });

    return res.json({ success: true, record });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ==========================================
// 2. RESOURCE REQUISITIONS
// ==========================================
export async function getRequisitions(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'ADMIN') {
      const requisitions = await prisma.resourceRequisition.findMany({
        include: { teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(requisitions);
    } else if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: user.id }
      });
      if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

      const requisitions = await prisma.resourceRequisition.findMany({
        where: { teacherId: teacher.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(requisitions);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createRequisition(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can file requisitions' });

  const { itemName, quantity, estimatedCost } = req.body;
  if (!itemName || !quantity || !estimatedCost) {
    return res.status(400).json({ error: 'itemName, quantity and estimatedCost are required' });
  }

  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id }
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const reqRecord = await prisma.resourceRequisition.create({
      data: {
        teacherId: teacher.id,
        itemName,
        quantity: parseInt(quantity),
        estimatedCost: parseFloat(estimatedCost),
        status: 'PENDING'
      }
    });

    return res.json({ success: true, requisition: reqRecord });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateRequisitionStatus(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only administrators can update status' });

  const { id } = req.params;
  const { status } = req.body; // APPROVED or REJECTED

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status parameter' });
  }

  try {
    const reqRecord = await prisma.resourceRequisition.update({
      where: { id },
      data: { status }
    });

    return res.json({ success: true, requisition: reqRecord });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ==========================================
// 3. FACULTY PROFESSIONAL DEVELOPMENT
// ==========================================
export async function getDevelopmentCredits(req: AuthRequest, res: Response) {
  const { teacherId } = req.params;
  try {
    const courses = await prisma.professionalDevelopment.findMany({
      where: { teacherId }
    });
    const totalCredits = courses.reduce((sum, c) => sum + c.creditsEarned, 0);
    return res.json({ courses, totalCredits });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function addDevelopmentCredit(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can log credentials' });

  const { courseTitle, creditsEarned, completionDate, status } = req.body;
  if (!courseTitle || !creditsEarned || !completionDate) {
    return res.status(400).json({ error: 'courseTitle, creditsEarned, and completionDate are required' });
  }

  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id }
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const course = await prisma.professionalDevelopment.create({
      data: {
        teacherId: teacher.id,
        courseTitle,
        creditsEarned: parseInt(creditsEarned),
        completionDate: new Date(completionDate),
        status: status || 'COMPLETED'
      }
    });

    return res.json({ success: true, course });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
