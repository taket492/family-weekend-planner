import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function handler() {
  try {
    // Best-effort DDL for Postgres
    // 1) Spot table: add latitude/longitude if missing
    await prisma.$executeRawUnsafe('ALTER TABLE "Spot" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION NULL')
    await prisma.$executeRawUnsafe('ALTER TABLE "Spot" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION NULL')

    // 2) Collaboration tables (create if not exists)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PlanInvite" (
        "id" TEXT PRIMARY KEY,
        "planId" TEXT NOT NULL,
        "email" TEXT,
        "role" TEXT NOT NULL DEFAULT 'editor',
        "token" TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "PlanInvite_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PlanComment" (
        "id" TEXT PRIMARY KEY,
        "planId" TEXT NOT NULL,
        "author" TEXT,
        "text" TEXT NOT NULL,
        "hidden" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "PlanComment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PlanChecklistItem" (
        "id" TEXT PRIMARY KEY,
        "planId" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "done" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "PlanChecklistItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE
      )
    `)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Migration route error', e)
    return NextResponse.json({ ok: false, error: (e as any)?.message || 'unknown' }, { status: 500 })
  }
}

export async function POST(_req: NextRequest) {
  return handler()
}

// Allow GET as well (to run from browser if POST is blocked)
export async function GET(_req: NextRequest) {
  return handler()
}
