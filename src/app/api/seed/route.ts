import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SpotCategory, PriceRange } from '@/types'

const sampleSpots = [
  {
    name: 'ファミリーレストラン くまさん',
    description: '子供向けメニューが豊富なファミリーレストラン',
    category: SpotCategory.RESTAURANT,
    address: '東京都渋谷区渋谷1-1-1',
    hasKidsMenu: true,
    hasHighChair: true,
    hasNursingRoom: false,
    isStrollerFriendly: true,
    hasDiaperChanging: true,
    hasPlayArea: true,
    phoneNumber: '03-1234-5678',
    openingHours: '11:00-21:00',
    priceRange: PriceRange.MODERATE,
    rating: 4.2,
    reviewCount: 156
  },
  {
    name: '代々木公園',
    description: '広い芝生エリアがある都市公園',
    category: SpotCategory.PARK,
    address: '東京都渋谷区代々木神園町2-1',
    hasKidsMenu: false,
    hasHighChair: false,
    hasNursingRoom: true,
    isStrollerFriendly: true,
    hasDiaperChanging: true,
    hasPlayArea: true,
    openingHours: '24時間',
    rating: 4.5,
    reviewCount: 2341
  },
  {
    name: 'キッズカフェ ぽんぽん',
    description: '子供が遊べるスペース付きカフェ',
    category: SpotCategory.CAFE,
    address: '東京都渋谷区原宿3-2-1',
    hasKidsMenu: true,
    hasHighChair: true,
    hasNursingRoom: true,
    isStrollerFriendly: true,
    hasDiaperChanging: true,
    hasPlayArea: true,
    phoneNumber: '03-2345-6789',
    openingHours: '10:00-18:00',
    priceRange: PriceRange.MODERATE,
    rating: 4.0,
    reviewCount: 89
  },
  {
    name: 'NHKスタジオパーク',
    description: 'テレビ番組体験ができる施設',
    category: SpotCategory.ENTERTAINMENT,
    address: '東京都渋谷区神南2-2-1',
    hasKidsMenu: false,
    hasHighChair: false,
    hasNursingRoom: true,
    isStrollerFriendly: true,
    hasDiaperChanging: true,
    hasPlayArea: true,
    phoneNumber: '03-3485-8034',
    website: 'https://www.nhk.or.jp/studiopark/',
    openingHours: '10:00-17:00',
    priceRange: PriceRange.BUDGET,
    rating: 4.1,
    reviewCount: 567
  },
  {
    name: '明治神宮',
    description: '歴史ある神社、自然豊かで散歩に最適',
    category: SpotCategory.TOURIST_SPOT,
    address: '東京都渋谷区代々木神園町1-1',
    hasKidsMenu: false,
    hasHighChair: false,
    hasNursingRoom: false,
    isStrollerFriendly: true,
    hasDiaperChanging: false,
    hasPlayArea: false,
    openingHours: '5:00-18:00',
    rating: 4.3,
    reviewCount: 4521
  }
]

export async function POST() {
  try {
    await prisma.spot.deleteMany()
    
    for (const spotData of sampleSpots) {
      await prisma.spot.create({
        data: spotData
      })
    }

    return NextResponse.json({ 
      message: `${sampleSpots.length}件のサンプルスポットを作成しました` 
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}
export const runtime = 'nodejs'
