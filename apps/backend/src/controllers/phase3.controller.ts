import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// ==========================================
// 1. DYNAMIC RBAC PERMISSIONS MATRIX
// ==========================================
export async function getRbacPolicies(req: AuthRequest, res: Response) {
  try {
    let policies = await prisma.rbacPolicy.findMany();

    if (policies.length === 0) {
      // Seed initial default policies list for dashboard
      const defaultPolicies = [
        { role: 'ADMIN', resource: 'ACADEMICS', canRead: true, canWrite: true },
        { role: 'ADMIN', resource: 'FINANCE', canRead: true, canWrite: true },
        { role: 'ADMIN', resource: 'OPERATIONS', canRead: true, canWrite: true },
        { role: 'ADMIN', resource: 'HEALTH', canRead: true, canWrite: true },

        { role: 'TEACHER', resource: 'ACADEMICS', canRead: true, canWrite: true },
        { role: 'TEACHER', resource: 'FINANCE', canRead: true, canWrite: false },
        { role: 'TEACHER', resource: 'OPERATIONS', canRead: true, canWrite: false },
        { role: 'TEACHER', resource: 'HEALTH', canRead: true, canWrite: false },

        { role: 'STUDENT', resource: 'ACADEMICS', canRead: true, canWrite: false },
        { role: 'STUDENT', resource: 'FINANCE', canRead: false, canWrite: false },
        { role: 'STUDENT', resource: 'OPERATIONS', canRead: false, canWrite: false },
        { role: 'STUDENT', resource: 'HEALTH', canRead: true, canWrite: false },

        { role: 'PARENT', resource: 'ACADEMICS', canRead: true, canWrite: false },
        { role: 'PARENT', resource: 'FINANCE', canRead: true, canWrite: false },
        { role: 'PARENT', resource: 'OPERATIONS', canRead: false, canWrite: false },
        { role: 'PARENT', resource: 'HEALTH', canRead: true, canWrite: false }
      ];

      for (const p of defaultPolicies) {
        await prisma.rbacPolicy.create({ data: p });
      }

      policies = await prisma.rbacPolicy.findMany();
    }

    return res.json(policies);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateRbacPolicies(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only administrators can update access control rules' });

  const { policies } = req.body; // Array of { id, canRead, canWrite }
  if (!Array.isArray(policies)) return res.status(400).json({ error: 'policies array is required' });

  try {
    for (const p of policies) {
      await prisma.rbacPolicy.update({
        where: { id: p.id },
        data: {
          canRead: p.canRead,
          canWrite: p.canWrite
        }
      });
    }

    const updated = await prisma.rbacPolicy.findMany();
    return res.json({ success: true, policies: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ==========================================
// 2. PTA NEWS & ANNOUNCEMENTS HUB
// ==========================================
export async function getAnnouncements(req: AuthRequest, res: Response) {
  try {
    const list = await prisma.announcement.findMany({
      include: {
        feedback: {
          include: { user: true },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createAnnouncement(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({ error: 'Only administrators and faculty can post official announcements' });
  }

  const { title, content, category } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

  try {
    const record = await prisma.announcement.create({
      data: {
        title,
        content,
        authorRole: user.role,
        category: category || 'NEWS'
      }
    });

    return res.json({ success: true, announcement: record });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function postAnnouncementFeedback(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params; // Announcement ID
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'comment content is required' });

  try {
    const feedback = await prisma.announcementFeedback.create({
      data: {
        announcementId: id,
        userId: user.id,
        comment
      },
      include: { user: true }
    });

    return res.json({ success: true, feedback });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
