import { NextRequest, NextResponse } from 'next/server'
import { AdvancedSpotSearch } from '@/lib/advanced-search'
import { spotCache } from '@/lib/cache'
import { SpotCategory } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const latitude = parseFloat(searchParams.get('lat') || '0')
    const longitude = parseFloat(searchParams.get('lng') || '0')
    const radius = parseInt(searchParams.get('radius') || '5') * 1000 // kmをmに変換
    const categories = searchParams.get('categories')?.split(',') as SpotCategory[]
    const minChildScore = parseInt(searchParams.get('minChildScore') || '30')
    const ageGroup = searchParams.get('ageGroup') as 'baby' | 'toddler' | 'child'
    
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

    // キャッシュチェック
    const cacheKey = spotCache.generateKey(latitude, longitude, { 
      radius, categories, minChildScore, ageGroup 
    })
    
    let spots = spotCache.get(cacheKey)
    
    if (!spots) {
      // キャッシュミス: 高度な統合検索実行
      spots = await AdvancedSpotSearch.comprehensiveSearch(
        latitude, 
        longitude, 
        radius, 
        { categories, minChildScore, ageGroup }
      )
      
      // インテリジェントキャッシュ保存
      const hour = new Date().getHours()
      const ttl = spotCache.calculateTTL(categories?.[0] || 'RESTAURANT', hour)
      spotCache.set(cacheKey, spots, ttl)
    }

    // フィルター適用
    if (categories?.length) {
      spots = spots.filter(spot => categories.includes(spot.category))
    }

    // 子連れ向けフィルター適用（厳密）
    if (hasKidsMenu) spots = spots.filter(spot => spot.hasKidsMenu)
    if (hasHighChair) spots = spots.filter(spot => spot.hasHighChair)
    if (hasNursingRoom) spots = spots.filter(spot => spot.hasNursingRoom)
    if (isStrollerFriendly) spots = spots.filter(spot => spot.isStrollerFriendly)
    if (hasDiaperChanging) spots = spots.filter(spot => spot.hasDiaperChanging)
    if (hasPlayArea) spots = spots.filter(spot => spot.hasPlayArea)

    // 年齢グループ別ソート
    if (ageGroup && spots.length > 0) {
      spots.sort((a, b) => {
        const scoreA = (a as any).ageAppropriate?.[ageGroup] || 0
        const scoreB = (b as any).ageAppropriate?.[ageGroup] || 0
        return scoreB - scoreA
      })
    }

    // 子連れ適性スコア＋距離の複合ソート
    spots.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.latitude - latitude, 2) + Math.pow(a.longitude - longitude, 2))
      const distB = Math.sqrt(Math.pow(b.latitude - longitude, 2) + Math.pow(b.longitude - longitude, 2))
      const scoreA = ((a as any).childFriendlyScore || 0) - (distA * 1000)
      const scoreB = ((b as any).childFriendlyScore || 0) - (distB * 1000)
      return scoreB - scoreA
    })

    return NextResponse.json(spots.slice(0, 50))
  } catch (error) {
    console.error('Error in advanced spot search:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spots from external APIs' },
      { status: 500 }
    )
  }
}