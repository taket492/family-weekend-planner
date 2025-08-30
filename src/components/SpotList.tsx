'use client'

import { useEffect } from 'react'
import { useSpotStore } from '@/lib/stores/useSpotStore'
import { Spot } from '@/types'
import SpotCard from './SpotCard'

interface SpotListProps {
  latitude: number
  longitude: number
}

export default function SpotList({ latitude, longitude }: SpotListProps) {
  const { 
    spots, 
    filters, 
    isLoading, 
    error, 
    searchSpots,
    addSelectedSpot,
    selectedSpots 
  } = useSpotStore()

  useEffect(() => {
    searchSpots(latitude, longitude)
  }, [latitude, longitude, filters, searchSpots])

  const handleAddToplan = (spot: Spot) => {
    if (!selectedSpots.find(s => s.id === spot.id)) {
      addSelectedSpot(spot)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          スポット一覧
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          スポット一覧
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        スポット一覧
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({spots.length}件)
        </span>
      </h2>
      
      {spots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            条件に合うスポットが見つかりませんでした
          </p>
          <p className="text-gray-400 text-sm mt-1">
            フィルター条件を調整してみてください
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {spots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onAddToPlan={() => handleAddToplan(spot)}
              isSelected={selectedSpots.some(s => s.id === spot.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}