'use client'

import { useState } from 'react'
import { SpotCategory, SeasonalEventType, PriceRange } from '@/types'

interface SpotFormData {
  name: string
  description: string
  category: SpotCategory
  address: string
  phoneNumber: string
  website: string
  openingHours: string
  priceRange?: PriceRange
  hasKidsMenu: boolean
  hasHighChair: boolean
  hasNursingRoom: boolean
  isStrollerFriendly: boolean
  hasDiaperChanging: boolean
  hasPlayArea: boolean
  isIndoor: boolean
  isOutdoor: boolean
  hasParking: boolean
  isFree: boolean
  hasPrivateRoom: boolean
  hasTatamiSeating: boolean
  seasonalEventType?: SeasonalEventType
}

const initialFormData: SpotFormData = {
  name: '',
  description: '',
  category: SpotCategory.RESTAURANT,
  address: '',
  phoneNumber: '',
  website: '',
  openingHours: '',
  hasKidsMenu: false,
  hasHighChair: false,
  hasNursingRoom: false,
  isStrollerFriendly: false,
  hasDiaperChanging: false,
  hasPlayArea: false,
  isIndoor: false,
  isOutdoor: false,
  hasParking: false,
  isFree: false,
  hasPrivateRoom: false,
  hasTatamiSeating: false
}

export function ManualSpotForm() {
  const [formData, setFormData] = useState<SpotFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/spots/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage('✅ スポットを登録しました！')
        setFormData(initialFormData)
      } else {
        const error = await response.json()
        setMessage(`❌ 登録に失敗しました: ${error.error || error.message || '不明なエラー'}`)
      }
    } catch (error) {
      setMessage('❌ 登録に失敗しました')
    }

    setIsSubmitting(false)
  }

  const handleChange = (field: keyof SpotFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">📝 スポット手動登録</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">スポット名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">カテゴリ *</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as SpotCategory)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value={SpotCategory.RESTAURANT}>🍽️ レストラン</option>
              <option value={SpotCategory.CAFE}>☕ カフェ</option>
              <option value={SpotCategory.PARK}>🏞️ 公園</option>
              <option value={SpotCategory.PLAYGROUND}>🎠 遊び場</option>
              <option value={SpotCategory.MUSEUM}>🏛️ 博物館</option>
              <option value={SpotCategory.SHOPPING}>🛍️ ショッピング</option>
              <option value={SpotCategory.ENTERTAINMENT}>🎭 エンタメ</option>
              <option value={SpotCategory.TOURIST_SPOT}>📍 観光スポット</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">説明</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full p-2 border rounded-md h-20"
            placeholder="子連れ向け情報や特徴を記載してください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">住所 *</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="静岡県〇〇市..."
            required
          />
        </div>


        {/* 連絡先情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">電話番号</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="054-123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ウェブサイト</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">営業時間</label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => handleChange('openingHours', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="10:00-22:00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">価格帯</label>
            <select
              value={formData.priceRange || ''}
              onChange={(e) => handleChange('priceRange', e.target.value || undefined)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              <option value={PriceRange.BUDGET}>💰 リーズナブル</option>
              <option value={PriceRange.MODERATE}>💰💰 普通</option>
              <option value={PriceRange.EXPENSIVE}>💰💰💰 高め</option>
            </select>
          </div>
        </div>

        {/* 子連れ向け設備 */}
        <div>
          <h3 className="font-medium mb-3">👶 子連れ向け設備</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'hasKidsMenu', label: '🍽️ キッズメニュー' },
              { key: 'hasHighChair', label: '🪑 ハイチェア' },
              { key: 'hasNursingRoom', label: '🍼 授乳室' },
              { key: 'isStrollerFriendly', label: '🚼 ベビーカーOK' },
              { key: 'hasDiaperChanging', label: '👶 おむつ交換台' },
              { key: 'hasPlayArea', label: '🎠 キッズスペース' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData[key as keyof SpotFormData] as boolean}
                  onChange={(e) => handleChange(key as keyof SpotFormData, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 施設情報 */}
        <div>
          <h3 className="font-medium mb-3">🏢 施設情報</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'isIndoor', label: '🏠 屋内' },
              { key: 'isOutdoor', label: '🌳 屋外' },
              { key: 'hasParking', label: '🅿️ 駐車場' },
              { key: 'isFree', label: '🆓 無料' },
              { key: 'hasPrivateRoom', label: '🚪 個室' },
              { key: 'hasTatamiSeating', label: '🌾 座敷' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData[key as keyof SpotFormData] as boolean}
                  onChange={(e) => handleChange(key as keyof SpotFormData, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 季節イベント */}
        <div>
          <label className="block text-sm font-medium mb-1">🌸 季節イベント</label>
          <select
            value={formData.seasonalEventType || ''}
            onChange={(e) => handleChange('seasonalEventType', e.target.value || undefined)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">なし</option>
            <option value={SeasonalEventType.FIREWORKS}>🎆 花火大会</option>
            <option value={SeasonalEventType.STRAWBERRY_PICKING}>🍓 いちご狩り</option>
            <option value={SeasonalEventType.SWIMMING_POOL}>🏊 プール・海水浴</option>
            <option value={SeasonalEventType.CHRISTMAS}>🎄 クリスマス</option>
            <option value={SeasonalEventType.CHERRY_BLOSSOM}>🌸 桜・花見</option>
            <option value={SeasonalEventType.AUTUMN_LEAVES}>🍁 紅葉</option>
            <option value={SeasonalEventType.SUMMER_FESTIVAL}>🏮 夏祭り</option>
            <option value={SeasonalEventType.WINTER_ILLUMINATION}>✨ イルミネーション</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setFormData(initialFormData)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            リセット
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '登録中...' : '📝 スポット登録'}
          </button>
        </div>
      </form>
    </div>
  )
}