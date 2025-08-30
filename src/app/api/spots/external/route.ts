import { NextRequest, NextResponse } from 'next/server'
import { searchNearbySpots } from '@/lib/external-apis'
import { SpotCategory, PriceRange } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const latitude = parseFloat(searchParams.get('lat') || '0')
    const longitude = parseFloat(searchParams.get('lng') || '0')
    const radius = parseInt(searchParams.get('radius') || '5') * 1000 // kmをmに変換
    const categories = searchParams.get('categories')?.split(',') as SpotCategory[]
    
    // 子連れ向けフィルター
    const hasKidsMenu = searchParams.get('hasKidsMenu') === 'true'
    const hasHighChair = searchParams.get('hasHighChair') === 'true'
    const hasNursingRoom = searchParams.get('hasNursingRoom') === 'true'
    const isStrollerFriendly = searchParams.get('isStrollerFriendly') === 'true'
    const hasDiaperChanging = searchParams.get('hasDiaperChanging') === 'true'
    const hasPlayArea = searchParams.get('hasPlayArea') === 'true'

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // 外部APIからスポット取得
    let spots = await searchNearbySpots(latitude, longitude, radius)

    // カテゴリフィルター適用
    if (categories?.length) {
      spots = spots.filter(spot => categories.includes(spot.category))
    }

    // 子連れ向けフィルター適用
    if (hasKidsMenu) spots = spots.filter(spot => spot.hasKidsMenu)
    if (hasHighChair) spots = spots.filter(spot => spot.hasHighChair)
    if (hasNursingRoom) spots = spots.filter(spot => spot.hasNursingRoom)
    if (isStrollerFriendly) spots = spots.filter(spot => spot.isStrollerFriendly)
    if (hasDiaperChanging) spots = spots.filter(spot => spot.hasDiaperChanging)
    if (hasPlayArea) spots = spots.filter(spot => spot.hasPlayArea)

    // 距離でソート（緯度経度から簡易計算）
    spots.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.latitude - latitude, 2) + Math.pow(a.longitude - longitude, 2))
      const distB = Math.sqrt(Math.pow(b.latitude - latitude, 2) + Math.pow(b.longitude - longitude, 2))
      return distA - distB
    })

    return NextResponse.json(spots)
  } catch (error) {
    console.error('Error fetching external spots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spots from external API' },
      { status: 500 }
    )
  }
}