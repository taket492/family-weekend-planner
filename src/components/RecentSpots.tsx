'use client'

import { useState, useEffect } from 'react'
import { SpotCategory, PriceRange } from '@/types'

interface RecentSpot {
  id: string
  name: string
  category: SpotCategory
  address: string
  region: string
  createdAt: string
  hasKidsMenu: boolean
  hasHighChair: boolean
  hasNursingRoom: boolean
  isStrollerFriendly: boolean
  priceRange?: PriceRange
}

const categoryIcons = {
  [SpotCategory.RESTAURANT]: '🍽️',
  [SpotCategory.CAFE]: '☕',
  [SpotCategory.PARK]: '🏞️',
  [SpotCategory.PLAYGROUND]: '🎠',
  [SpotCategory.MUSEUM]: '🏛️',
  [SpotCategory.SHOPPING]: '🛍️',
  [SpotCategory.ENTERTAINMENT]: '🎭',
  [SpotCategory.TOURIST_SPOT]: '📍'
}

const categoryLabels = {
  [SpotCategory.RESTAURANT]: 'レストラン',
  [SpotCategory.CAFE]: 'カフェ',
  [SpotCategory.PARK]: '公園',
  [SpotCategory.PLAYGROUND]: '遊び場',
  [SpotCategory.MUSEUM]: '博物館',
  [SpotCategory.SHOPPING]: 'ショッピング',
  [SpotCategory.ENTERTAINMENT]: 'エンタメ',
  [SpotCategory.TOURIST_SPOT]: '観光スポット'
}

export function RecentSpots() {
  const [spots, setSpots] = useState<RecentSpot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentSpots()
  }, [])

  const fetchRecentSpots = async () => {
    try {
      const response = await fetch('/api/spots/recent')
      if (response.ok) {
        const data = await response.json()
        setSpots(data.spots)
      }
    } catch (error) {
      console.error('Failed to fetch recent spots:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">🆕 最近登録されたスポット</h2>
        <div className="text-center text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (spots.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">🆕 最近登録されたスポット</h2>
        <div className="text-center text-gray-500">まだスポットが登録されていません</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">🆕 最近登録されたスポット</h2>
      
      <div className="space-y-3">
        {spots.map((spot) => (
          <div key={spot.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{categoryIcons[spot.category]}</span>
                  <h3 className="font-medium text-lg">{spot.name}</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {categoryLabels[spot.category]}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  📍 {spot.address} ({spot.region})
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {spot.hasKidsMenu && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">🍽️ キッズメニュー</span>
                  )}
                  {spot.hasHighChair && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">🪑 ハイチェア</span>
                  )}
                  {spot.hasNursingRoom && (
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded">🍼 授乳室</span>
                  )}
                  {spot.isStrollerFriendly && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">🚼 ベビーカーOK</span>
                  )}
                  {spot.priceRange && (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      💰 {spot.priceRange === PriceRange.BUDGET ? 'リーズナブル' : 
                           spot.priceRange === PriceRange.MODERATE ? '普通' : '高め'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 ml-4">
                {new Date(spot.createdAt).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}