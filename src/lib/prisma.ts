import { PrismaClient } from '@prisma/client';

function getSafeDatasources() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  // Ensure connection timeout (5s) and pool timeout (5s)
  // so Prisma never hangs the Next.js server indefinitely if the database is unreachable
  let url = rawUrl;
  if (!url.includes('connect_timeout=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}connect_timeout=5&pool_timeout=5`;
  }
  return { db: { url } };
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: getSafeDatasources(),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;


