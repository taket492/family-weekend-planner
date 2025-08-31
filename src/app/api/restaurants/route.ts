import { NextRequest, NextResponse } from 'next/server'
import { Restaurant, CuisineType, PriceRange, SpotCategory } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const latitude = parseFloat(searchParams.get('lat') || '0')
    const longitude = parseFloat(searchParams.get('lng') || '0')
    const radius = parseInt(searchParams.get('radius') || '5') * 1000
    const cuisine = searchParams.get('cuisine')?.split(',') as CuisineType[]
    const priceRange = searchParams.get('priceRange')?.split(',') as PriceRange[]
    const minKidsFriendlyRating = parseFloat(searchParams.get('minKidsFriendlyRating') || '0')
    
    const hasKidsChair = searchParams.get('hasKidsChair') === 'true'
    const hasKidsMenu = searchParams.get('hasKidsMenu') === 'true'
    const hasDiaperChangingTable = searchParams.get('hasDiaperChangingTable') === 'true'
    const hasNursingRoom = searchParams.get('hasNursingRoom') === 'true'
    const acceptsReservations = searchParams.get('acceptsReservations') === 'true'

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // モックデータ（実際の実装では外部APIから取得）
    let restaurants: Restaurant[] = generateMockRestaurants(latitude, longitude)

    // フィルター適用
    if (cuisine?.length) {
      restaurants = restaurants.filter(r => 
        r.cuisine.some(c => cuisine.includes(c))
      )
    }
    
    if (priceRange?.length) {
      restaurants = restaurants.filter(r => 
        r.priceRange && priceRange.includes(r.priceRange)
      )
    }
    
    if (hasKidsChair) restaurants = restaurants.filter(r => r.hasKidsChair)
    if (hasKidsMenu) restaurants = restaurants.filter(r => r.hasKidsMenu)
    if (hasDiaperChangingTable) restaurants = restaurants.filter(r => r.hasDiaperChangingTable)
    if (hasNursingRoom) restaurants = restaurants.filter(r => r.hasNursingRoom)
    if (acceptsReservations) restaurants = restaurants.filter(r => r.acceptsReservations)
    if (minKidsFriendlyRating > 0) {
      restaurants = restaurants.filter(r => r.kidsFriendlyRating >= minKidsFriendlyRating)
    }

    // 距離でソート
    restaurants = restaurants
      .map(r => ({
        ...r,
        distance: Math.sqrt(Math.pow(r.latitude - latitude, 2) + Math.pow(r.longitude - longitude, 2)) * 111000
      }))
      .filter(r => r.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json(restaurants.slice(0, 50))
  } catch (error) {
    console.error('Error searching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    )
  }
}

function generateMockRestaurants(baseLat: number, baseLng: number): Restaurant[] {
  const mockRestaurants: Restaurant[] = []
  
  const restaurantNames = [
    'ファミリーレストラン さくら', 'キッズカフェ ぽんぽん', 'バーミヤン 静岡店',
    'ガスト 浜松店', 'サイゼリヤ 沼津店', 'しゃぶしゃぶ温野菜', 
    'とんかつ かつ彩', 'うどん屋 こだわり', 'ピザハット 富士店',
    'マクドナルド 静岡駅前店', 'ケンタッキー 浜松西店', '回転寿司 はま寿司',
    '焼肉きんぐ 静岡店', 'イタリアン トマト', 'そば処 静岡庵'
  ]

  for (let i = 0; i < 15; i++) {
    const restaurant: Restaurant = {
      id: `restaurant_${i}`,
      name: restaurantNames[i],
      description: '子連れ歓迎のファミリーレストランです',
      category: SpotCategory.RESTAURANT,
      address: `静岡県静岡市${i + 1}-${i + 1}-${i + 1}`,
      latitude: baseLat + (Math.random() - 0.5) * 0.02,
      longitude: baseLng + (Math.random() - 0.5) * 0.02,
      
      hasKidsMenu: Math.random() > 0.3,
      hasHighChair: Math.random() > 0.4,
      hasNursingRoom: Math.random() > 0.7,
      isStrollerFriendly: Math.random() > 0.2,
      hasDiaperChanging: Math.random() > 0.6,
      hasPlayArea: Math.random() > 0.8,
      
      phoneNumber: `054-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      openingHours: '11:00-22:00',
      priceRange: [PriceRange.BUDGET, PriceRange.MODERATE, PriceRange.EXPENSIVE][Math.floor(Math.random() * 3)],
      
      rating: 3.0 + Math.random() * 2,
      reviewCount: Math.floor(Math.random() * 500) + 10,
      
      cuisine: [
        [CuisineType.FAMILY_RESTAURANT],
        [CuisineType.JAPANESE],
        [CuisineType.ITALIAN],
        [CuisineType.CHINESE],
        [CuisineType.FAST_FOOD]
      ][Math.floor(Math.random() * 5)],
      
      hasKidsChair: Math.random() > 0.3,
      hasDiaperChangingTable: Math.random() > 0.6,
      acceptsReservations: Math.random() > 0.4,
      kidsFriendlyRating: 2.5 + Math.random() * 2.5,
      averageMealTime: 60 + Math.floor(Math.random() * 60),
      smokingPolicy: (['non_smoking', 'smoking_section', 'smoking_allowed'] as const)[Math.floor(Math.random() * 3)],
      
      tabelogUrl: Math.random() > 0.5 ? `https://tabelog.com/restaurant${i}` : undefined,
      gurunaviUrl: Math.random() > 0.5 ? `https://gurunavi.com/restaurant${i}` : undefined
    }
    
    mockRestaurants.push(restaurant)
  }
  
  return mockRestaurants
}