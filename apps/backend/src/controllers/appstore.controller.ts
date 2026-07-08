import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// --- Get App Packages ---
export async function getPackages(req: Request, res: Response) {
  try {
    const list = await prisma.appPackage.findMany({
      include: { instances: true },
      orderBy: { name: 'asc' }
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Install App Package ---
export async function installPackage(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only administrators can manage systems modules' });

  const { id } = req.params;
  try {
    const pkg = await prisma.appPackage.update({
      where: { id },
      data: { isInstalled: true }
    });

    await prisma.auditLog.create({
      data: {
        action: 'INSTALL_APP',
        performedBy: user.email,
        details: `Installed EduOS package: ${pkg.name}`,
      }
    });

    return res.json(pkg);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Uninstall App Package ---
export async function uninstallPackage(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

  const { id } = req.params;
  try {
    const pkg = await prisma.appPackage.update({
      where: { id },
      data: { isInstalled: false }
    });

    // Clear instances
    await prisma.appInstance.deleteMany({
      where: { packageId: id }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UNINSTALL_APP',
        performedBy: user.email,
        details: `Uninstalled EduOS package: ${pkg.name}`,
      }
    });

    return res.json(pkg);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Configure / Save Instance data ---
export async function saveInstanceConfig(req: AuthRequest, res: Response) {
  const { packageId, configData } = req.body;
  if (!packageId || !configData) return res.status(400).json({ error: 'Package ID and Configuration telemetry data are required' });

  try {
    // Delete old configurations for this app (singleton instance setup)
    await prisma.appInstance.deleteMany({
      where: { packageId }
    });

    const instance = await prisma.appInstance.create({
      data: {
        packageId,
        configData: JSON.stringify(configData)
      }
    });

    return res.status(201).json(instance);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Custom App Dynamic Prompt Compiler ---
export async function createAppFromPrompt(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admins can compile custom modules' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Feature specification prompt details required' });

  try {
    // Dynamic App Schema Compiler logic: parses user description and builds fields schema
    const name = prompt.split(' ').slice(0, 3).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Module';
    const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, '');

    // Mocks schema properties based on words
    const category = prompt.toLowerCase().includes('money') || prompt.toLowerCase().includes('pay') ? 'ERP' :
                     prompt.toLowerCase().includes('bus') || prompt.toLowerCase().includes('room') ? 'LOGISTICS' : 'ACADEMIC';

    const fields = [
      { label: 'Asset Identifier Tag', name: 'assetTag', type: 'text', placeholder: 'e.g. LCK-203' },
      { label: 'Workforce Load Threshold', name: 'threshold', type: 'number', placeholder: 'e.g. 50' },
      { label: 'Monitoring Escalation Email', name: 'alertEmail', type: 'text', placeholder: 'admin@school.com' }
    ];

    const configSchema = JSON.stringify(fields);

    const customPkg = await prisma.appPackage.create({
      data: {
        name: cleanName,
        category,
        description: `Custom app compiled from spec prompt: "${prompt}"`,
        icon: '⚙️',
        isInstalled: true,
        configSchema
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'COMPILE_CUSTOM_APP',
        performedBy: user.email,
        details: `Successfully compiled prompt feature: ${cleanName}`,
      }
    });

    return res.status(201).json(customPkg);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
