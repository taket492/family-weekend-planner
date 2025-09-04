import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || ''
    if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
      // Graceful fallback when DB is not configured
      return NextResponse.json({ success: true, spots: [] })
    }
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
    console.error('Recent spots fetch error (graceful fallback):', error)
    // Return empty list to avoid surfacing server errors in dev without DB
    return NextResponse.json({ success: true, spots: [] })
  }
}
export const runtime = 'nodejs'
