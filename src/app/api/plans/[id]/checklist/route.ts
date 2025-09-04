import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function verifyToken(planId: string, token?: string | null) {
  if (!token) return false
  const inv = await prisma.planInvite.findFirst({ where: { planId, token } })
  return !!inv
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const planId = params.id
    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const auth = req.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    const ok = await verifyToken(planId, token)
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as { text: string }
    if (!body?.text || body.text.trim().length === 0) return NextResponse.json({ error: 'Text required' }, { status: 400 })
    const item = await prisma.planChecklistItem.create({ data: { planId, text: body.text.trim() } })
    return NextResponse.json(item)
  } catch (e) {
    console.error('Checklist create error', e)
    return NextResponse.json({ error: 'Failed to create checklist item' }, { status: 500 })
  }
}

export const runtime = 'nodejs'

