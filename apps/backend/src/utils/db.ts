import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

let dbPath = '';
const pathsToTry = [
  path.resolve(process.cwd(), 'prisma', 'dev.db'),
  path.join(__dirname, '..', 'prisma', 'dev.db'),
  path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
  path.join('/var/task', 'prisma', 'dev.db'),
  path.join('/var/task', 'apps', 'backend', 'prisma', 'dev.db')
];

for (const p of pathsToTry) {
  if (fs.existsSync(p)) {
    dbPath = p;
    break;
  }
}

if (!dbPath) {
  dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

export default prisma;
