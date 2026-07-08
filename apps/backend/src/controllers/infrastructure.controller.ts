import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// --- Biometric Access Log Parser ---
export async function uploadBiometricCSV(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin permission required to parse logs' });

  const { csvText } = req.body;
  if (!csvText) return res.status(400).json({ error: 'CSV file text stream is required' });

  try {
    const lines = csvText.split('\n');
    let importedCount = 0;

    for (const line of lines) {
      if (!line.trim() || line.startsWith('admissionNo')) continue; // skip headers/empty lines
      
      const parts = line.split(',');
      if (parts.length < 3) continue;

      const admissionNo = parts[0].trim();
      const timeStr = parts[1].trim();
      const gate = parts[2].trim();

      // Find student
      const student = await prisma.studentProfile.findUnique({
        where: { admissionNo },
        include: { class: true }
      });
      if (!student) continue;

      const logTimestamp = new Date(timeStr);

      // Create Biometric Log
      await prisma.biometricLog.create({
        data: {
          studentId: student.id,
          timestamp: logTimestamp,
          gate
        }
      });

      // Automatically register Daily Attendance based on check-in time
      const hour = logTimestamp.getHours();
      const status = (hour < 8 || (hour === 8 && logTimestamp.getMinutes() <= 30)) ? 'PRESENT' : 'LATE';

      // Check if attendance already recorded for this student on this day
      const startOfDay = new Date(logTimestamp.setHours(0,0,0,0));
      const endOfDay = new Date(logTimestamp.setHours(23,59,59,999));

      const existingAtt = await prisma.attendance.findFirst({
        where: {
          studentId: student.id,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      if (!existingAtt && student.classId) {
        await prisma.attendance.create({
          data: {
            studentId: student.id,
            classId: student.classId,
            date: startOfDay,
            status,
            remarks: `Automatically recorded via Biometric scan at ${gate}`,
          }
        });
      }

      importedCount++;
    }

    await prisma.auditLog.create({
      data: {
        action: 'BIOMETRIC_IMPORT',
        performedBy: user.email,
        details: `Imported biometric logs. Total check-ins registered: ${importedCount}`,
      }
    });

    return res.json({ success: true, message: `Successfully synchronized ${importedCount} student biometric records.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getBiometricLogs(req: AuthRequest, res: Response) {
  try {
    const list = await prisma.biometricLog.findMany({
      include: { student: { include: { user: true } } },
      orderBy: { timestamp: 'desc' },
      take: 30
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Incident & Disciplinary Ticketing ---
export async function createDisciplinaryIncident(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can log incidents' });

  const { studentId, severity, description } = req.body;
  if (!studentId || !severity || !description) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const incident = await prisma.disciplinaryIncident.create({
      data: {
        studentId,
        teacherId: teacher.id,
        severity,
        description,
        actionTaken: 'Awaiting Administrator / Counselor Review',
        status: 'PENDING'
      },
      include: { student: { include: { user: true } } }
    });

    // Notify administrators
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Disciplinary Referral',
          message: `Incident logged for ${incident.student.user.name} (${severity} severity)`,
        }
      });
    }

    return res.status(201).json(incident);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getDisciplinaryIncidents(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      const list = await prisma.disciplinaryIncident.findMany({
        where: { studentId: student.id },
        include: { teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(list);
    } else {
      const list = await prisma.disciplinaryIncident.findMany({
        include: {
          student: { include: { user: true } },
          teacher: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(list);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateIncidentStatus(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

  const { id } = req.params;
  const { status, actionTaken } = req.body; // PENDING, ESCALATED, RESOLVED

  try {
    const incident = await prisma.disciplinaryIncident.update({
      where: { id },
      data: { status, actionTaken },
      include: { student: { include: { user: true } } }
    });

    // Notify parent if escalated
    if (status === 'ESCALATED' && incident.student.parentId) {
      const parent = await prisma.parentProfile.findUnique({ where: { id: incident.student.parentId } });
      if (parent) {
        await prisma.notification.create({
          data: {
            userId: parent.userId,
            title: 'Disciplinary Escalation Notification',
            message: `Official review meeting requested for student ${incident.student.user.name}.`,
          }
        });
      }
    }

    return res.json(incident);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- IoT Smart Meters webhooks ---
export async function getIoTMetersData(req: Request, res: Response) {
  // Simulate active sensors stream data
  const data = {
    electricityKWh: parseFloat((120 + Math.random() * 15).toFixed(1)),
    waterLitres: parseFloat((450 + Math.random() * 50).toFixed(1)),
    lastUpdated: new Date().toLocaleTimeString(),
  };
  return res.json(data);
}
