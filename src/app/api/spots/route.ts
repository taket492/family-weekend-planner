import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SpotCategory, PriceRange } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const latitude = parseFloat(searchParams.get('lat') || '0')
    const longitude = parseFloat(searchParams.get('lng') || '0')
    const radius = parseInt(searchParams.get('radius') || '5')
    const categories = searchParams.get('categories')?.split(',') as SpotCategory[]
    const priceRanges = searchParams.get('priceRanges')?.split(',') as PriceRange[]
    
    // 子連れ向けフィルター
    const hasKidsMenu = searchParams.get('hasKidsMenu') === 'true'
    const hasHighChair = searchParams.get('hasHighChair') === 'true'
    const hasNursingRoom = searchParams.get('hasNursingRoom') === 'true'
    const isStrollerFriendly = searchParams.get('isStrollerFriendly') === 'true'
    const hasDiaperChanging = searchParams.get('hasDiaperChanging') === 'true'
    const hasPlayArea = searchParams.get('hasPlayArea') === 'true'

    const whereClause: any = {}

    if (categories?.length) {
      whereClause.category = { in: categories }
    }

    if (priceRanges?.length) {
      whereClause.priceRange = { in: priceRanges }
    }

    // 子連れ向けフィルター適用
    if (hasKidsMenu) whereClause.hasKidsMenu = true
    if (hasHighChair) whereClause.hasHighChair = true
    if (hasNursingRoom) whereClause.hasNursingRoom = true
    if (isStrollerFriendly) whereClause.isStrollerFriendly = true
    if (hasDiaperChanging) whereClause.hasDiaperChanging = true
    if (hasPlayArea) whereClause.hasPlayArea = true

    // 地理的範囲フィルター（簡易版）
    if (latitude && longitude && radius) {
      const latDelta = radius / 111.0 // 緯度1度 ≈ 111km
      const lngDelta = radius / (111.0 * Math.cos(latitude * Math.PI / 180))
      
      whereClause.latitude = {
        gte: latitude - latDelta,
        lte: latitude + latDelta
      }
      whereClause.longitude = {
        gte: longitude - lngDelta,
        lte: longitude + lngDelta
      }
    }

    const spots = await prisma.spot.findMany({
      where: whereClause,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ]
    })

    return NextResponse.json(spots)
  } catch (error) {
    console.error('Error fetching spots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spots' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const spot = await prisma.spot.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        hasKidsMenu: body.hasKidsMenu || false,
        hasHighChair: body.hasHighChair || false,
        hasNursingRoom: body.hasNursingRoom || false,
        isStrollerFriendly: body.isStrollerFriendly || false,
        hasDiaperChanging: body.hasDiaperChanging || false,
        hasPlayArea: body.hasPlayArea || false,
        phoneNumber: body.phoneNumber,
        website: body.website,
        openingHours: body.openingHours,
        priceRange: body.priceRange,
        rating: body.rating,
        reviewCount: body.reviewCount || 0
      }
    })

    return NextResponse.json(spot)
  } catch (error) {
    console.error('Error creating spot:', error)
    return NextResponse.json(
      { error: 'Failed to create spot' },
      { status: 500 }
    )
  }
}