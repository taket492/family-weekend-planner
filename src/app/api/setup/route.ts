import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function runMigrations() {
  // Add missing columns (idempotent)
  await prisma.$executeRawUnsafe('ALTER TABLE "Spot" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION NULL')
  await prisma.$executeRawUnsafe('ALTER TABLE "Spot" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION NULL')
}

export async function POST(request: NextRequest) {
  try {
    // テーブル作成確認（Prismaは自動でテーブルを作成します）
    await prisma.$connect()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || searchParams.get('migrate')
    if (action === '1' || action === 'true' || action === 'migrate') {
      await runMigrations()
      return NextResponse.json({ message: 'Migrations executed' })
    }
    
    // 簡単な接続テスト
    const spotCount = await prisma.spot.count()
    
    return NextResponse.json({ 
      message: 'Database setup successful',
      spotCount 
    })
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { error: 'Database setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
export async function GET(request: NextRequest) {
  return POST(request)
}
export const runtime = 'nodejs'
