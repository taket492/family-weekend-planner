import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // テーブル作成確認（Prismaは自動でテーブルを作成します）
    await prisma.$connect()
    
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