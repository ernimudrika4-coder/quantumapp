import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __quantumPrisma: PrismaClient | undefined;
}

export const prisma = global.__quantumPrisma ?? new PrismaClient({
  log: ['warn', 'error']
});

if (process.env.NODE_ENV !== 'production') {
  global.__quantumPrisma = prisma;
}

export async function dbAvailable() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
