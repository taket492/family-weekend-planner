'use client'

import { useEffect } from 'react'
import { useSpotStore } from '@/lib/stores/useSpotStore'
import { Spot } from '@/types'
import SpotCard from './SpotCard'

interface SpotListProps {
  region: string
  prefecture: string
}

export default function SpotList({ region, prefecture }: SpotListProps) {
  const { 
    spots, 
    filters, 
    isLoading, 
    error, 
    searchSpots
  } = useSpotStore()

  useEffect(() => {
    searchSpots(region, prefecture)
  }, [region, prefecture, filters, searchSpots])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          🔍 スポット検索中...
        </h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">子連れ向けスポットを検索しています</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          ❌ 検索エラー
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <div className="text-4xl mb-3">😞</div>
          <p className="text-red-600 font-medium mb-2">検索に失敗しました</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">
          🔍 スポット検索結果
          <span className="text-lg font-normal text-gray-500 ml-3">
            {spots.length}件見つかりました
          </span>
        </h2>
        
        {spots.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📍 {prefecture} {region} 周辺</span>
          </div>
        )}
      </div>
      
      {spots.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg text-gray-500 mb-2">
            条件に合うスポットが見つかりませんでした
          </p>
          <p className="text-gray-400">
            フィルター条件を調整してみてください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
          {spots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onAddToPlan={() => {}}
              isSelected={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}