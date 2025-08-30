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
    <div className="border border-gray-200 rounded-lg p-5 transition-all hover:shadow-md hover:border-gray-300 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{spot.name}</h3>
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
      
      <div className="flex items-start gap-2 mb-3">
        <span className="text-gray-400 mt-1">📍</span>
        <p className="text-sm text-gray-600 flex-1">{spot.address}</p>
      </div>
      
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
        <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
          <div className="flex items-center">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="text-base font-bold ml-1 text-gray-900">{spot.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500 ml-2">({spot.reviewCount}件のレビュー)</span>
          </div>
          {spot.priceRange && (
            <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded">
              {priceRangeLabels[spot.priceRange]}
            </span>
          )}
        </div>
      )}
      
      {facilities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">🧸 子連れ向け設備</h4>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility) => (
              <span
                key={facility}
                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">🔗 詳細情報・アクション</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          
          {/* Google Maps ナビゲーションボタン */}
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}&travelmode=driving`
              window.open(url, '_blank')
            }}
            className="flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            🗺️ ナビ開始
          </button>
          
          {/* レビューサイトリンク */}
          {extendedSpot.tabelogUrl && (
            <a 
              href={extendedSpot.tabelogUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              🍽️ 食べログ
            </a>
          )}
          {extendedSpot.gurunaviUrl && (
            <a 
              href={extendedSpot.gurunaviUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              🍴 ぐるなび
            </a>
          )}
          {extendedSpot.instagramUrl && (
            <a 
              href={extendedSpot.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-pink-500 text-white px-3 py-2 rounded-md hover:bg-pink-600 transition-colors text-sm font-medium"
            >
              📸 Instagram
            </a>
          )}
          
          {spot.website && (
            <a 
              href={spot.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              🌐 公式サイト
            </a>
          )}
        </div>
        
        {extendedSpot.source && (
          <div className="mt-3 text-xs text-gray-400 text-center">
            データ提供: {extendedSpot.source}
          </div>
        )}
      </div>
    </div>
  )
}