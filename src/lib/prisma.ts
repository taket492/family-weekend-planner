import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prefer pooled Prisma URL for serverless (Vercel Postgres / Neon)
const prismaUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: prismaUrl
      ? {
          db: {
            url: prismaUrl,
          },
        }
      : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
