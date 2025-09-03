import { NextRequest, NextResponse } from 'next/server'
import { AdvancedSpotSearch } from '@/lib/advanced-search'
import { spotCache } from '@/lib/cache'
import { SpotCategory, ExtendedSpot } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const region = searchParams.get('region') || '静岡市'
    const prefecture = searchParams.get('prefecture') || '静岡県'
    const categories = searchParams.get('categories')?.split(',') as SpotCategory[]
    const minChildScore = parseInt(searchParams.get('minChildScore') || '30')
    const ageGroup = searchParams.get('ageGroup') as 'baby' | 'toddler' | 'child'
    const sortBy = searchParams.get('sortBy') as 'popularity' | 'rating' | 'recent' || 'popularity'
    const showOnlyShizuoka = searchParams.get('showOnlyShizuoka') === 'true'
    const showTrending = searchParams.get('showTrending') === 'true'
    
    // 子連れ向けフィルター
    const hasKidsMenu = searchParams.get('hasKidsMenu') === 'true'
    const hasHighChair = searchParams.get('hasHighChair') === 'true'
    const hasNursingRoom = searchParams.get('hasNursingRoom') === 'true'
    const isStrollerFriendly = searchParams.get('isStrollerFriendly') === 'true'
    const hasDiaperChanging = searchParams.get('hasDiaperChanging') === 'true'
    const hasPlayArea = searchParams.get('hasPlayArea') === 'true'

    if (!region) {
      return NextResponse.json(
        { error: 'Region is required' },
        { status: 400 }
      )
    }

    // キャッシュチェック
    const cacheKey = spotCache.generateKey(region, prefecture, { 
      categories, minChildScore, ageGroup 
    })
    
    let spots: ExtendedSpot[] = spotCache.get(cacheKey) || []
    
    if (spots.length === 0) {
      // キャッシュミス: 高度な統合検索実行
      spots = await AdvancedSpotSearch.comprehensiveSearch(
        region, 
        prefecture, 
        { categories, minChildScore, ageGroup }
      )
      
      // インテリジェントキャッシュ保存
      const hour = new Date().getHours()
      const ttl = spotCache.calculateTTL(categories?.[0] || 'RESTAURANT', hour)
      spotCache.set(cacheKey, spots, ttl)
    }

    // フィルター適用
    if (categories?.length) {
      spots = spots.filter((spot) => categories.includes(spot.category))
    }

    // 子連れ向けフィルター適用（厳密）
    if (hasKidsMenu) spots = spots.filter((spot) => spot.hasKidsMenu)
    if (hasHighChair) spots = spots.filter((spot) => spot.hasHighChair)
    if (hasNursingRoom) spots = spots.filter((spot) => spot.hasNursingRoom)
    if (isStrollerFriendly) spots = spots.filter((spot) => spot.isStrollerFriendly)
    if (hasDiaperChanging) spots = spots.filter((spot) => spot.hasDiaperChanging)
    if (hasPlayArea) spots = spots.filter((spot) => spot.hasPlayArea)

    // 年齢グループ別ソート
    if (ageGroup && spots.length > 0) {
      spots.sort((a, b) => {
        const scoreA = a.ageAppropriate?.[ageGroup as keyof typeof a.ageAppropriate] || 0
        const scoreB = b.ageAppropriate?.[ageGroup as keyof typeof b.ageAppropriate] || 0
        return scoreB - scoreA
      })
    }

    // 静岡エリアフィルター
    if (showOnlyShizuoka) {
      spots = spots.filter(spot => 
        spot.isShizuokaSpot || 
        spot.address.includes('静岡') ||
        spot.region?.includes('静岡')
      )
    }

    // トレンドフィルター
    if (showTrending) {
      spots = spots.filter(spot => spot.isTrending)
    }

    // 地域フィルタリング
    spots = spots.filter(spot => 
      spot.region === region || 
      spot.address.includes(region) || 
      spot.address.includes(prefecture)
    )

    // ソート機能
    switch (sortBy) {
      case 'popularity':
        spots.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
        break
      case 'rating':
        spots.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'recent':
        spots.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
        break
      default:
        // デフォルトは子連れ適性スコアでソート
        spots.sort((a, b) => {
          const scoreA = (a.childFriendlyScore || 0)
          const scoreB = (b.childFriendlyScore || 0)
          return scoreB - scoreA
        })
    }

    return NextResponse.json(spots.slice(0, 100))
  } catch (error) {
    console.error('Error in advanced spot search:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spots from external APIs' },
      { status: 500 }
    )
  }
}
export const runtime = 'nodejs'
