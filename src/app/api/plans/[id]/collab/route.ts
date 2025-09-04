import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function verifyToken(planId: string, token?: string | null) {
  if (!token) return false
  const inv = await prisma.planInvite.findFirst({ where: { planId, token } })
  return !!inv
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: planId } = await ctx.params
    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const auth = req.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    const ok = await verifyToken(planId, token)
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [comments, checklist] = await Promise.all([
      prisma.planComment.findMany({ where: { planId, hidden: false }, orderBy: { createdAt: 'desc' } }),
      prisma.planChecklistItem.findMany({ where: { planId }, orderBy: { createdAt: 'asc' } })
    ])
    return NextResponse.json({ comments, checklist })
  } catch (e) {
    console.error('Collab fetch error', e)
    return NextResponse.json({ error: 'Failed to fetch collab data' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
