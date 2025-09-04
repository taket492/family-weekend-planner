import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function verifyToken(planId: string, token?: string | null) {
  if (!token) return false
  const inv = await prisma.planInvite.findFirst({ where: { planId, token } })
  return !!inv
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string, itemId: string }> }) {
  try {
    const { id: planId, itemId: id } = await ctx.params
    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const auth = req.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    const ok = await verifyToken(planId, token)
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(()=>({})) as { done?: boolean }
    const item = await prisma.planChecklistItem.update({ where: { id }, data: { done: body.done ?? undefined } })
    return NextResponse.json(item)
  } catch (e) {
    console.error('Checklist update error', e)
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string, itemId: string }> }) {
  try {
    const { id: planId, itemId: id } = await ctx.params
    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const auth = req.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    const ok = await verifyToken(planId, token)
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.planChecklistItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Checklist delete error', e)
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
