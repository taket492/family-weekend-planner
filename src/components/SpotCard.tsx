'use client'

import { Spot, SpotCategory, PriceRange } from '@/types'

interface SpotCardProps {
  spot: Spot
  onAddToPlan: () => void
  isSelected: boolean
}

const categoryLabels = {
  [SpotCategory.RESTAURANT]: 'レストラン',
  [SpotCategory.CAFE]: 'カフェ',
  [SpotCategory.PLAYGROUND]: '遊び場',
  [SpotCategory.PARK]: '公園',
  [SpotCategory.MUSEUM]: '博物館',
  [SpotCategory.SHOPPING]: 'ショッピング',
  [SpotCategory.ENTERTAINMENT]: 'エンターテイメント',
  [SpotCategory.TOURIST_SPOT]: '観光スポット'
}

const priceRangeLabels = {
  [PriceRange.BUDGET]: '〜1,000円',
  [PriceRange.MODERATE]: '1,000〜3,000円',
  [PriceRange.EXPENSIVE]: '3,000円〜'
}

export default function SpotCard({ spot, onAddToPlan, isSelected }: SpotCardProps) {
  const facilities = []
  if (spot.hasKidsMenu) facilities.push('キッズメニュー')
  if (spot.hasHighChair) facilities.push('ハイチェア')
  if (spot.hasNursingRoom) facilities.push('授乳室')
  if (spot.isStrollerFriendly) facilities.push('ベビーカーOK')
  if (spot.hasDiaperChanging) facilities.push('おむつ交換台')
  if (spot.hasPlayArea) facilities.push('キッズスペース')

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{spot.name}</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {categoryLabels[spot.category]}
        </span>
      </div>
      
      {spot.description && (
        <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
      )}
      
      <p className="text-sm text-gray-500 mb-2">{spot.address}</p>
      
      {spot.rating && (
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium ml-1">{spot.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500 ml-1">({spot.reviewCount}件)</span>
          </div>
          {spot.priceRange && (
            <span className="text-sm text-gray-500 ml-4">
              {priceRangeLabels[spot.priceRange]}
            </span>
          )}
        </div>
      )}
      
      {facilities.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {facilities.map((facility) => (
              <span
                key={facility}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        {spot.openingHours && (
          <span className="text-xs text-gray-500">{spot.openingHours}</span>
        )}
        
        <button
          onClick={onAddToPlan}
          disabled={isSelected}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            isSelected
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSelected ? '追加済み' : 'プランに追加'}
        </button>
      </div>
    </div>
  )
}