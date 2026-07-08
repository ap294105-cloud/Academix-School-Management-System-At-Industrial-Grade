import { PrismaClient } from '@prisma/client';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

export default prisma;
