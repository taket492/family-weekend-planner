'use client'

import { useState } from 'react'
import { SpotCategory, PriceRange } from '@/types'

interface RestaurantFormData {
  name: string
  description: string
  address: string
  phoneNumber: string
  website: string
  openingHours: string
  priceRange?: PriceRange
  cuisine: string
  hasKidsMenu: boolean
  hasHighChair: boolean
  hasNursingRoom: boolean
  isStrollerFriendly: boolean
  hasDiaperChanging: boolean
  hasPlayArea: boolean
  hasPrivateRoom: boolean
  hasTatamiSeating: boolean
  hasParking: boolean
  smokingPolicy: 'NO_SMOKING' | 'SMOKING_ALLOWED' | 'SEPARATE_AREAS'
  reservationRequired: boolean
  acceptsCreditCard: boolean
  hasWifi: boolean
  isChainStore: boolean
}

const initialFormData: RestaurantFormData = {
  name: '',
  description: '',
  address: '',
  phoneNumber: '',
  website: '',
  openingHours: '',
  cuisine: '',
  hasKidsMenu: false,
  hasHighChair: false,
  hasNursingRoom: false,
  isStrollerFriendly: false,
  hasDiaperChanging: false,
  hasPlayArea: false,
  hasPrivateRoom: false,
  hasTatamiSeating: false,
  hasParking: false,
  smokingPolicy: 'NO_SMOKING',
  reservationRequired: false,
  acceptsCreditCard: false,
  hasWifi: false,
  isChainStore: false
}

export function ManualRestaurantForm() {
  const [formData, setFormData] = useState<RestaurantFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/restaurants/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: SpotCategory.RESTAURANT
        })
      })

      if (response.ok) {
        setMessage('✅ レストランを登録しました！')
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

  const handleChange = (field: keyof RestaurantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">🍽️ レストラン手動登録</h2>
      
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
            <label className="block text-sm font-medium mb-1">店舗名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">料理ジャンル</label>
            <input
              type="text"
              value={formData.cuisine}
              onChange={(e) => handleChange('cuisine', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="和食、洋食、中華、イタリアンなど"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">説明</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full p-2 border rounded-md h-20"
            placeholder="子連れ向けサービスや店舗の特徴を記載してください"
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


        {/* 連絡先・営業情報 */}
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
              placeholder="https://restaurant-example.com"
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
              placeholder="11:00-22:00"
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
              <option value={PriceRange.BUDGET}>💰 〜1,000円</option>
              <option value={PriceRange.MODERATE}>💰💰 1,000〜3,000円</option>
              <option value={PriceRange.EXPENSIVE}>💰💰💰 3,000円〜</option>
            </select>
          </div>
        </div>

        {/* 喫煙ポリシー */}
        <div>
          <label className="block text-sm font-medium mb-1">🚭 喫煙ポリシー</label>
          <select
            value={formData.smokingPolicy}
            onChange={(e) => handleChange('smokingPolicy', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="NO_SMOKING">🚭 完全禁煙</option>
            <option value="SEPARATE_AREAS">🚬 分煙</option>
            <option value="SMOKING_ALLOWED">🚬 喫煙可</option>
          </select>
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
                  checked={formData[key as keyof RestaurantFormData] as boolean}
                  onChange={(e) => handleChange(key as keyof RestaurantFormData, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 店舗設備 */}
        <div>
          <h3 className="font-medium mb-3">🏪 店舗設備</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'hasPrivateRoom', label: '🚪 個室' },
              { key: 'hasTatamiSeating', label: '🌾 座敷' },
              { key: 'hasParking', label: '🅿️ 駐車場' },
              { key: 'reservationRequired', label: '📞 要予約' },
              { key: 'acceptsCreditCard', label: '💳 カード可' },
              { key: 'hasWifi', label: '📶 WiFi' },
              { key: 'isChainStore', label: '🏪 チェーン店' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData[key as keyof RestaurantFormData] as boolean}
                  onChange={(e) => handleChange(key as keyof RestaurantFormData, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
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
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {isSubmitting ? '登録中...' : '🍽️ レストラン登録'}
          </button>
        </div>
      </form>
    </div>
  )
}