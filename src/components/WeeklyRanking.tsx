'use client'

import { useState, useEffect } from 'react'
import { Spot, SeasonalRecommendation } from '@/types'
import SpotCard from './SpotCard'
import { useProfileStore, ageToBucket } from '@/lib/stores/useProfileStore'

interface WeeklyRankingData {
  weeklyRanking: Spot[]
  seasonalRecommendations: SeasonalRecommendation[]
  region: string
  generatedAt: string
}

export default function WeeklyRanking() {
  const [rankingData, setRankingData] = useState<WeeklyRankingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { children } = useProfileStore()

  useEffect(() => {
    fetchWeeklyRanking()
  }, [children])

  const fetchWeeklyRanking = async () => {
    try {
      let weights = ' '
      if (children.length) {
        let baby = 0, toddler = 0, child = 0
        for (const c of children) {
          const b = ageToBucket(c)
          if (b === 'baby') baby++
          else if (b === 'toddler') toddler++
          else child++
        }
        const sum = baby + toddler + child || 1
        weights = `&weights=${(baby/sum).toFixed(2)},${(toddler/sum).toFixed(2)},${(child/sum).toFixed(2)}`
      }
      const response = await fetch(`/api/ranking/weekly?region=静岡県${weights}`)
      if (!response.ok) throw new Error('Failed to fetch ranking')
      
      const data = await response.json()
      setRankingData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 週間ランキング</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !rankingData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 週間ランキング</h2>
        <p className="text-red-600">ランキング情報の取得に失敗しました</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 季節のおすすめ */}
      {rankingData.seasonalRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            🌸 今の季節のおすすめ
          </h2>
          {rankingData.seasonalRecommendations.map((rec, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <h3 className="font-semibold text-gray-800 mb-2">{rec.reason}</h3>
              <div className="flex flex-wrap gap-2">
                {rec.specialFeatures.map((feature, idx) => (
                  <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 週間ランキング */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          🏆 {rankingData.region} 週間人気ランキング
        </h2>
        
        <div className="space-y-4">
          {rankingData.weeklyRanking.slice(0, 5).map((spot, index) => (
            <div key={spot.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-amber-600' :
                'bg-gray-300'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                <p className="text-sm text-gray-600">{spot.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  {spot.rating && (
                    <span className="text-sm text-yellow-600">★ {spot.rating.toFixed(1)}</span>
                  )}
                  {spot.popularityScore && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      人気度 {spot.popularityScore.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`
                  window.open(url, '_blank')
                }}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
              >
                🗺️ 地図
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-400 text-center mt-4">
          更新日時: {new Date(rankingData.generatedAt).toLocaleString('ja-JP')}
        </div>
      </div>
    </div>
  )
}
