// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse the PrismaClient in development to prevent too many instances
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], 
  });


// check to prevent multiple clients in dev
if (!globalForPrisma.prisma && (process.env.NODE_ENV || 'development') !== 'production') {
  globalForPrisma.prisma = prisma;
}
