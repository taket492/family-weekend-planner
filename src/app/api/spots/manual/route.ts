import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SpotCategory, SeasonalEventType, PriceRange } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 必須フィールドの検証
    if (!body.name || !body.address || !body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: '名前、住所、座標は必須です' },
        { status: 400 }
      )
    }

    // 座標の妥当性チェック（静岡県周辺）
    if (body.latitude < 34 || body.latitude > 36 || body.longitude < 137 || body.longitude > 140) {
      return NextResponse.json(
        { error: '座標が静岡県周辺の範囲外です' },
        { status: 400 }
      )
    }

    // 重複チェック
    const existing = await prisma.spot.findFirst({
      where: {
        OR: [
          { name: body.name },
          {
            AND: [
              { latitude: { gte: body.latitude - 0.001, lte: body.latitude + 0.001 } },
              { longitude: { gte: body.longitude - 0.001, lte: body.longitude + 0.001 } }
            ]
          }
        ]
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: '同じ名前または近い位置のスポットが既に存在します' },
        { status: 409 }
      )
    }

    // 地域を住所から抽出
    const region = extractRegion(body.address)

    // 新規スポット作成
    const newSpot = await prisma.spot.create({
      data: {
        name: body.name,
        description: body.description || '',
        category: body.category as SpotCategory,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        
        // 連絡先情報
        phoneNumber: body.phoneNumber || null,
        website: body.website || null,
        openingHours: body.openingHours || null,
        priceRange: body.priceRange as PriceRange || null,
        
        // 子連れ向け設備
        hasKidsMenu: body.hasKidsMenu || false,
        hasHighChair: body.hasHighChair || false,
        hasNursingRoom: body.hasNursingRoom || false,
        isStrollerFriendly: body.isStrollerFriendly || false,
        hasDiaperChanging: body.hasDiaperChanging || false,
        hasPlayArea: body.hasPlayArea || false,
        
        // 施設情報
        isIndoor: body.isIndoor || false,
        isOutdoor: body.isOutdoor || false,
        hasParking: body.hasParking || false,
        isFree: body.isFree || false,
        hasPrivateRoom: body.hasPrivateRoom || false,
        hasTatamiSeating: body.hasTatamiSeating || false,
        
        // 季節イベント
        seasonalEventType: body.seasonalEventType as SeasonalEventType || null,
        
        // 静岡関連
        region,
        isShizuokaSpot: true,
        
        // デフォルト値
        rating: null,
        reviewCount: 0,
        popularityScore: 50.0
      }
    })

    return NextResponse.json({
      success: true,
      spot: newSpot,
      message: 'スポットが正常に登録されました'
    })

  } catch (error) {
    console.error('Manual spot creation error:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: '同じスポットが既に存在します' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'スポットの登録に失敗しました' },
      { status: 500 }
    )
  }
}

// 地域抽出ヘルパー関数
function extractRegion(address: string): string {
  const regions = [
    '静岡市葵区', '静岡市駿河区', '静岡市清水区',
    '浜松市中央区', '浜松市浜名区', '浜松市天竜区',
    '沼津市', '熱海市', '富士市', '伊豆市', '藤枝市', '焼津市', 
    '三島市', '磐田市', '掛川市', '袋井市', '湖西市'
  ]
  
  const foundRegion = regions.find(region => address.includes(region))
  
  if (foundRegion) return foundRegion
  
  // 大まかな市区分け
  if (address.includes('静岡市')) return '静岡市'
  if (address.includes('浜松市')) return '浜松市'
  
  return '静岡県'
}