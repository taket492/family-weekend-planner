import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: planId } = await ctx.params
    const body = await req.json().catch(() => ({})) as { email?: string; role?: string }

    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const token = generateToken()
    const invite = await prisma.planInvite.create({
      data: {
        planId,
        email: body.email || null,
        role: body.role || 'editor',
        token,
      }
    })

    const origin = req.headers.get('x-forwarded-host') ? `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('x-forwarded-host')}` : undefined
    const inviteUrl = origin ? `${origin}/?invite=${token}` : undefined

    return NextResponse.json({ invite, inviteUrl })
  } catch (e) {
    console.error('Invite create error', e)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
