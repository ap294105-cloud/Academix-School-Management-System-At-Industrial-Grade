import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { JWT_SECRET } from '../middleware/auth';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: true,
        student: true,
        parent: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    // Find role-specific profile ID
    let profileId: string | null = null;
    if (user.role === 'TEACHER' && user.teacher) profileId = user.teacher.id;
    if (user.role === 'STUDENT' && user.student) profileId = user.student.id;
    if (user.role === 'PARENT' && user.parent) profileId = user.parent.id;

    // Log the login event
    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGIN',
        performedBy: user.email,
        details: `Successful login for role ${user.role}`,
      },
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileId,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

export async function getCurrentUser(req: any, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        teacher: true,
        student: true,
        parent: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profileId: string | null = null;
    if (user.role === 'TEACHER' && user.teacher) profileId = user.teacher.id;
    if (user.role === 'STUDENT' && user.student) profileId = user.student.id;
    if (user.role === 'PARENT' && user.parent) profileId = user.parent.id;

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileId,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
