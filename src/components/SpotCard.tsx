'use client'

import { Spot, SpotCategory, PriceRange, ExtendedSpot } from '@/types'

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

  // 拡張情報の取得
  const extendedSpot = spot as ExtendedSpot
  const childScore = extendedSpot.childFriendlyScore
  const crowdLevel = extendedSpot.crowdLevel
  const isOpen = extendedSpot.isCurrentlyOpen
  const todayHours = extendedSpot.todayHours
  const ageScores = extendedSpot.ageAppropriate

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{spot.name}</h3>
          {extendedSpot.isTrending && (
            <span className="inline-flex items-center text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mt-1">
              🔥 話題のスポット
            </span>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {categoryLabels[spot.category]}
          </span>
          {childScore && (
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              childScore >= 80 ? 'bg-green-100 text-green-700' :
              childScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              子連れ度{childScore}
            </span>
          )}
        </div>
      </div>
      
      {spot.description && (
        <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
      )}
      
      <p className="text-sm text-gray-500 mb-2">{spot.address}</p>
      
      {/* 営業状況・混雑度表示 */}
      <div className="flex items-center gap-4 mb-2 text-sm">
        {isOpen !== undefined && (
          <span className={`font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
            {isOpen ? '営業中' : '営業時間外'}
          </span>
        )}
        {crowdLevel && (
          <span className="text-sm">{crowdLevel}</span>
        )}
        {todayHours && (
          <span className="text-xs text-gray-500">{todayHours}</span>
        )}
      </div>

      {/* 年齢別推奨度 */}
      {ageScores && (
        <div className="mb-2">
          <div className="flex gap-1 text-xs">
            <span className={`px-2 py-1 rounded ${ageScores.baby >= 70 ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-500'}`}>
              👶 {ageScores.baby}
            </span>
            <span className={`px-2 py-1 rounded ${ageScores.toddler >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              🧒 {ageScores.toddler}
            </span>
            <span className={`px-2 py-1 rounded ${ageScores.child >= 70 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
              👦 {ageScores.child}
            </span>
          </div>
        </div>
      )}
      
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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {extendedSpot.source && (
            <span className="text-xs text-gray-400">
              {extendedSpot.source}
            </span>
          )}
          
          {/* レビューサイトリンク */}
          {extendedSpot.tabelogUrl && (
            <a 
              href={extendedSpot.tabelogUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:underline"
            >
              食べログ
            </a>
          )}
          {extendedSpot.gurunaviUrl && (
            <a 
              href={extendedSpot.gurunaviUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:underline"
            >
              ぐるなび
            </a>
          )}
          {extendedSpot.instagramUrl && (
            <a 
              href={extendedSpot.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded hover:underline"
            >
              Instagram
            </a>
          )}
          
          {/* Google Maps ナビゲーションボタン */}
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}&travelmode=driving`
              window.open(url, '_blank')
            }}
            className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors"
          >
            🗺️ ここへ行く
          </button>
          
          {spot.website && (
            <a 
              href={spot.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              詳細
            </a>
          )}
        </div>
        
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