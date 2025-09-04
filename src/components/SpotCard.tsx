'use client'

import { useState } from 'react'
import { Spot, SpotCategory, PriceRange, ExtendedSpot } from '@/types'
import { useBookmarkStore } from '@/lib/stores/useBookmarkStore'
import CalendarIntegration from './CalendarIntegration'
import ShareModal from './ShareModal'
import AffiliateLinks from './AffiliateLinks'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { useReviewStore } from '@/lib/stores/useReviewStore'

interface SpotCardProps {
  spot: Spot
  onAddToPlan: () => void
  isSelected: boolean
  userId?: string
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

export default function SpotCard({ spot, onAddToPlan, isSelected, userId = 'default-user' }: SpotCardProps) {
  const [showBookmarkForm, setShowBookmarkForm] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [bookmarkNotes, setBookmarkNotes] = useState('')
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore()
  const authUser = useAuthStore(state => state.user)
  const { reviews, addReview, hideReview } = useReviewStore()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewTags, setReviewTags] = useState<string[]>([])
  
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
  const bookmarked = isBookmarked(spot.id)
  const primaryLink = spot.website || extendedSpot.tabelogUrl || extendedSpot.gurunaviUrl || extendedSpot.instagramUrl

  const handleBookmarkToggle = async () => {
    if (bookmarked) {
      await removeBookmark(authUser?.id || userId, spot.id)
    } else {
      setShowBookmarkForm(true)
    }
  }

  const handleBookmarkSave = async () => {
    await addBookmark(authUser?.id || userId, spot, bookmarkNotes)
    setShowBookmarkForm(false)
    setBookmarkNotes('')
  }

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`
    window.open(url, '_blank')
  }

  const openNearbyRestaurants = () => {
    const restaurantUrl = `/restaurants?region=${encodeURIComponent(spot.region || '静岡')}&spotName=${encodeURIComponent(spot.name)}`
    window.open(restaurantUrl, '_blank')
  }

  return (
    <Card className={`border transition-all hover:shadow-md ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{spot.name}</h3>
          {extendedSpot.isTrending && (
            <span className="inline-flex items-center text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mt-1">
              🔥 話題のスポット
            </span>
          )}
        </div>
        <div className="flex gap-2 items-start">
          {/* Small-screen overflow menu */}
          <div className="md:hidden">
            <Dropdown trigger={<span aria-hidden>⋯</span>} buttonAriaLabel="その他のアクション">
              {authUser && (
                <DropdownItem onClick={handleBookmarkToggle}>{bookmarked ? '⭐ お気に入り解除' : '☆ お気に入り追加'}</DropdownItem>
              )}
              <DropdownItem onClick={() => setShowCalendar(true)}>📅 予定に追加</DropdownItem>
              <DropdownItem onClick={() => setShowShare(true)}>📤 共有</DropdownItem>
              <DropdownItem onClick={openMaps}>🗺️ ナビ開始 (Google Maps)</DropdownItem>
              <DropdownItem onClick={openNearbyRestaurants}>🍽️ 周辺レストラン</DropdownItem>
              {extendedSpot.tabelogUrl && (
                <DropdownItem href={extendedSpot.tabelogUrl}>🍽️ 食べログ</DropdownItem>
              )}
              {extendedSpot.gurunaviUrl && (
                <DropdownItem href={extendedSpot.gurunaviUrl}>🍴 ぐるなび</DropdownItem>
              )}
              {extendedSpot.instagramUrl && (
                <DropdownItem href={extendedSpot.instagramUrl}>📸 Instagram</DropdownItem>
              )}
              {spot.website && (
                <DropdownItem href={spot.website}>🌐 公式サイト</DropdownItem>
              )}
            </Dropdown>
          </div>
          <div className="flex gap-1 flex-wrap">
            <Badge>{categoryLabels[spot.category]}</Badge>
            {childScore && (<Badge>子連れ度{childScore}</Badge>)}
          </div>
        </div>
      </div>
      
      {spot.description && (
        <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
      )}
      
      <div className="flex items-start gap-2 mb-3">
        <span className="text-gray-400 mt-1">📍</span>
        <p className="text-sm text-gray-600 flex-1">{spot.address}</p>
      </div>
      {primaryLink && (
        <div className="flex items-start gap-2 mb-3">
          <span className="text-gray-400 mt-1">🔗</span>
          <a
            href={primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            リンクを開く
          </a>
        </div>
      )}
      
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
            <Badge>👶 {ageScores.baby}</Badge>
            <Badge>🧒 {ageScores.toddler}</Badge>
            <Badge>👦 {ageScores.child}</Badge>
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
      {/* Local reviews summary */}
      {reviews[spot.id]?.length ? (
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
          <span>ユーザー評価: {(
            reviews[spot.id].filter(r=>!r.hidden).reduce((a, r) => a + r.rating, 0) / Math.max(1, reviews[spot.id].filter(r=>!r.hidden).length)
          ).toFixed(1)} / 5</span>
          <button className="text-xs text-blue-600 hover:underline" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? '閉じる' : 'レビューを書く'}
          </button>
        </div>
      ) : (
        <div className="mb-2">
          <button className="text-xs text-blue-600 hover:underline" onClick={() => setShowReviewForm(!showReviewForm)}>
            レビューを書く
          </button>
        </div>
      )}
      {showReviewForm && (
        <div className="mb-3 p-3 bg-gray-50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm">評価</label>
            <select value={reviewRating} onChange={(e)=>setReviewRating(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
              {[5,4,3,2,1].map(v=> <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mb-2 text-xs">
            {['ベビーカー', '授乳室', '静かさ', '席間隔', '清潔さ'].map(tag => (
              <label key={tag} className={`px-2 py-1 rounded border cursor-pointer ${reviewTags.includes(tag)?'bg-blue-600 text-white':'bg-white'}`}>
                <input type="checkbox" className="hidden" checked={reviewTags.includes(tag)} onChange={()=> setReviewTags(prev => prev.includes(tag)? prev.filter(t=>t!==tag) : [...prev, tag])} />
                {tag}
              </label>
            ))}
          </div>
          <textarea value={reviewText} onChange={(e)=>setReviewText(e.target.value)} placeholder="簡易レビュー" className="w-full border rounded p-2 text-sm" rows={2} />
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={()=>{ addReview({ spotId: spot.id, rating: reviewRating, tags: reviewTags, text: reviewText }); setShowReviewForm(false); setReviewText(''); setReviewTags([]) }}>投稿</Button>
            <Button size="sm" variant="secondary" onClick={()=> setShowReviewForm(false)}>キャンセル</Button>
          </div>
        </div>
      )}
      
      {facilities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">🧸 子連れ向け設備</h4>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility) => (
              <Badge key={facility}>{facility}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">🔗 詳細情報・アクション</h4>
        <div className="hidden md:grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 mb-3">
          
          {/* ブックマークボタン */}
          {authUser && (
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
          )}
          
          {/* Google Maps ナビゲーションボタン */}
          <button
            onClick={openMaps}
            className="flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            🗺️ ナビ開始
          </button>
          
          {/* カレンダー追加ボタン */}
          <Button onClick={() => setShowCalendar(true)} size="sm">📅 予定に追加</Button>
          
          {/* 共有ボタン */}
          <Button onClick={() => setShowShare(true)} size="sm">📤 共有</Button>
          
          {/* 周辺レストラン検索ボタン */}
          <Button onClick={openNearbyRestaurants} size="sm">
            🍽️ 周辺レストラン
          </Button>
          
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
        
        {/* アフィリエイトリンク */}
        <AffiliateLinks spot={spot} />
        
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
              <Button size="sm" onClick={handleBookmarkSave}>保存</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowBookmarkForm(false)}>キャンセル</Button>
            </div>
          </div>
        )}
        
        {/* カレンダー連動モーダル */}
        {showCalendar && (
          <CalendarIntegration
            spot={spot}
            onClose={() => setShowCalendar(false)}
          />
        )}
        
        {/* 共有モーダル */}
        {showShare && (
          <ShareModal
            spot={spot}
            onClose={() => setShowShare(false)}
          />
        )}
      </div>
    </Card>
  )
}
