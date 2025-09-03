import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // 軽い接続テスト
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, time: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'db_unreachable' }, { status: 500 })
  }
}

