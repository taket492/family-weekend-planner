import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const recentSpots = await prisma.spot.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        category: true,
        address: true,
        region: true,
        createdAt: true,
        hasKidsMenu: true,
        hasHighChair: true,
        hasNursingRoom: true,
        isStrollerFriendly: true,
        priceRange: true
      }
    })

    return NextResponse.json({
      success: true,
      spots: recentSpots
    })

  } catch (error) {
    console.error('Recent spots fetch error:', error)
    return NextResponse.json(
      { error: '最近のスポット取得に失敗しました' },
      { status: 500 }
    )
  }
}
export const runtime = 'nodejs'
