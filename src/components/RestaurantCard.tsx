'use client'

import { useState } from 'react'
import { Restaurant, CuisineType, PriceRange } from '@/types'
import { useBookmarkStore } from '@/lib/stores/useBookmarkStore'

interface RestaurantCardProps {
  restaurant: Restaurant
  userId?: string
}

const cuisineLabels = {
  [CuisineType.JAPANESE]: '和食',
  [CuisineType.ITALIAN]: 'イタリアン',
  [CuisineType.CHINESE]: '中華',
  [CuisineType.FRENCH]: 'フレンチ',
  [CuisineType.AMERICAN]: 'アメリカン',
  [CuisineType.KOREAN]: '韓国料理',
  [CuisineType.FAST_FOOD]: 'ファストフード',
  [CuisineType.FAMILY_RESTAURANT]: 'ファミリーレストラン',
  [CuisineType.BUFFET]: 'ビュッフェ'
}

const priceRangeLabels = {
  [PriceRange.BUDGET]: '〜1,000円',
  [PriceRange.MODERATE]: '1,000〜3,000円',
  [PriceRange.EXPENSIVE]: '3,000円〜'
}

const smokingPolicyLabels = {
  'non_smoking': '完全禁煙',
  'smoking_section': '分煙',
  'smoking_allowed': '喫煙可'
}

export default function RestaurantCard({ restaurant, userId = 'default-user' }: RestaurantCardProps) {
  const [showBookmarkForm, setShowBookmarkForm] = useState(false)
  const [bookmarkNotes, setBookmarkNotes] = useState('')
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore()
  
  const facilities = []
  if (restaurant.hasKidsChair) facilities.push('子供用椅子')
  if (restaurant.hasKidsMenu) facilities.push('キッズメニュー')
  if (restaurant.hasDiaperChangingTable) facilities.push('おむつ交換台')
  if (restaurant.hasNursingRoom) facilities.push('授乳室')
  if (restaurant.acceptsReservations) facilities.push('予約可')

  const bookmarked = isBookmarked(restaurant.id)

  const handleBookmarkToggle = async () => {
    if (bookmarked) {
      await removeBookmark(userId, restaurant.id)
    } else {
      setShowBookmarkForm(true)
    }
  }

  const handleBookmarkSave = async () => {
    await addBookmark(userId, restaurant, bookmarkNotes, ['restaurant'])
    setShowBookmarkForm(false)
    setBookmarkNotes('')
  }

  const getKidsFriendlyColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700'
    if (rating >= 4.0) return 'bg-yellow-100 text-yellow-700'
    if (rating >= 3.0) return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-5 transition-all hover:shadow-md hover:border-gray-300 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{restaurant.name}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {restaurant.cuisine.map(cuisine => (
              <span key={cuisine} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {cuisineLabels[cuisine]}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded font-medium ${getKidsFriendlyColor(restaurant.kidsFriendlyRating)}`}>
            子連れ度 {restaurant.kidsFriendlyRating.toFixed(1)}
          </span>
        </div>
      </div>
      
      {restaurant.description && (
        <p className="text-sm text-gray-600 mb-2">{restaurant.description}</p>
      )}
      
      <div className="flex items-start gap-2 mb-3">
        <span className="text-gray-400 mt-1">📍</span>
        <p className="text-sm text-gray-600 flex-1">{restaurant.address}</p>
      </div>
      
      {restaurant.distance && (
        <div className="text-sm text-gray-500 mb-2">
          📏 約 {(restaurant.distance / 1000).toFixed(1)}km
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
        <div className="flex items-center">
          {restaurant.rating && (
            <>
              <span className="text-yellow-400 text-lg">★</span>
              <span className="text-base font-bold ml-1 text-gray-900">{restaurant.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-2">({restaurant.reviewCount}件)</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {restaurant.priceRange && (
            <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded">
              {priceRangeLabels[restaurant.priceRange]}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded ${
            restaurant.smokingPolicy === 'non_smoking' ? 'bg-green-100 text-green-700' :
            restaurant.smokingPolicy === 'smoking_section' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {smokingPolicyLabels[restaurant.smokingPolicy]}
          </span>
        </div>
      </div>
      
      {restaurant.averageMealTime && (
        <div className="text-sm text-gray-600 mb-3">
          ⏱️ 平均滞在時間: {restaurant.averageMealTime}分
        </div>
      )}
      
      {facilities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">👶 子連れ向け設備</h4>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility) => (
              <span
                key={facility}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t pt-4 mt-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleBookmarkToggle}
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
              bookmarked 
                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {bookmarked ? '⭐ お気に入り済み' : '☆ お気に入り追加'}
          </button>
          
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}&travelmode=driving`
              window.open(url, '_blank')
            }}
            className="flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            🗺️ ナビ開始
          </button>
        </div>
        
        {/* レビューサイトリンク */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {restaurant.tabelogUrl && (
            <a 
              href={restaurant.tabelogUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              🍽️ 食べログ
            </a>
          )}
          {restaurant.gurunaviUrl && (
            <a 
              href={restaurant.gurunaviUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              🍴 ぐるなび
            </a>
          )}
          {restaurant.website && (
            <a 
              href={restaurant.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              🌐 公式サイト
            </a>
          )}
        </div>
        
        {/* ブックマーク追加フォーム */}
        {showBookmarkForm && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <textarea
              placeholder="メモを追加（任意）"
              value={bookmarkNotes}
              onChange={(e) => setBookmarkNotes(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleBookmarkSave}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
              >
                保存
              </button>
              <button
                onClick={() => setShowBookmarkForm(false)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}