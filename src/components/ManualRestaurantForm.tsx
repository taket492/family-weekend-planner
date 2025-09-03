'use client'

import { useRef, useState } from 'react'
import { SpotCategory, PriceRange } from '@/types'
import { useToast } from '@/components/ui/ToastProvider'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const firstInvalidRef = useRef<HTMLInputElement | null>(null)
  const { show } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const invalids: string[] = []
      if (!formData.name.trim()) invalids.push('name')
      if (!formData.address.trim()) invalids.push('address')
      if (invalids.length) {
        setTouched((prev) => ({ ...prev, name: true, address: true }))
        setIsSubmitting(false)
        setMessage('❌ 必須項目を入力してください')
        show({ type: 'error', message: '必須項目を入力してください' })
        firstInvalidRef.current?.focus()
        return
      }
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
        show({ type: 'success', message: 'レストランを登録しました' })
        setFormData(initialFormData)
      } else {
        const error = await response.json()
        const msg = `登録に失敗しました: ${error.error || error.message || '不明なエラー'}`
        setMessage(`❌ ${msg}`)
        show({ type: 'error', message: msg })
      }
    } catch (error) {
      setMessage('❌ 登録に失敗しました')
      show({ type: 'error', message: '登録に失敗しました' })
    }

    setIsSubmitting(false)
  }

  const handleChange = (field: keyof RestaurantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">店舗名 *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              ref={firstInvalidRef}
              aria-invalid={touched.name && !formData.name.trim()}
              invalid={touched.name && !formData.name.trim()}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">料理ジャンル</label>
            <Input
              value={formData.cuisine}
              onChange={(e) => handleChange('cuisine', e.target.value)}
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
          <Input
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, address: true }))}
            aria-invalid={touched.address && !formData.address.trim()}
            invalid={touched.address && !formData.address.trim()}
            placeholder="静岡県〇〇市..."
            required
          />
        </div>


        {/* 連絡先・営業情報 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">電話番号</label>
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="054-123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ウェブサイト</label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://restaurant-example.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">営業時間</label>
            <Input
              value={formData.openingHours}
              onChange={(e) => handleChange('openingHours', e.target.value)}
              placeholder="11:00-22:00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">価格帯</label>
            <Select
              value={formData.priceRange || ''}
              onChange={(e) => handleChange('priceRange', (e.target as HTMLSelectElement).value || undefined)}
            >
              <option value="">選択してください</option>
              <option value={PriceRange.BUDGET}>💰 〜1,000円</option>
              <option value={PriceRange.MODERATE}>💰💰 1,000〜3,000円</option>
              <option value={PriceRange.EXPENSIVE}>💰💰💰 3,000円〜</option>
            </Select>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'hasKidsMenu', label: '🍽️ キッズメニュー' },
              { key: 'hasHighChair', label: '🪑 ハイチェア' },
              { key: 'hasNursingRoom', label: '🍼 授乳室' },
              { key: 'isStrollerFriendly', label: '🚼 ベビーカーOK' },
              { key: 'hasDiaperChanging', label: '👶 おむつ交換台' },
              { key: 'hasPlayArea', label: '🎠 キッズスペース' }
            ].map(({ key, label }) => (
              <Checkbox
                key={key}
                checked={formData[key as keyof RestaurantFormData] as boolean}
                onChange={(e) => handleChange(key as keyof RestaurantFormData, (e.target as HTMLInputElement).checked)}
                label={label}
              />
            ))}
          </div>
        </div>

        {/* 店舗設備 */}
        <div>
          <h3 className="font-medium mb-3">🏪 店舗設備</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'hasPrivateRoom', label: '🚪 個室' },
              { key: 'hasTatamiSeating', label: '🌾 座敷' },
              { key: 'hasParking', label: '🅿️ 駐車場' },
              { key: 'reservationRequired', label: '📞 要予約' },
              { key: 'acceptsCreditCard', label: '💳 カード可' },
              { key: 'hasWifi', label: '📶 WiFi' },
              { key: 'isChainStore', label: '🏪 チェーン店' }
            ].map(({ key, label }) => (
              <Checkbox
                key={key}
                checked={formData[key as keyof RestaurantFormData] as boolean}
                onChange={(e) => handleChange(key as keyof RestaurantFormData, (e.target as HTMLInputElement).checked)}
                label={label}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => setFormData(initialFormData)} disabled={isSubmitting}>
            リセット
          </Button>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '登録中...' : '🍽️ レストラン登録'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
