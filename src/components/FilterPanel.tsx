"use client"

import { useSpotStore } from '@/lib/stores/useSpotStore'
import { SpotCategory, PriceRange, SearchFilters, SeasonalEventType } from '@/types'
import { useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

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

const seasonalEventLabels = {
  [SeasonalEventType.FIREWORKS]: '🎆 花火大会',
  [SeasonalEventType.STRAWBERRY_PICKING]: '🍓 いちご狩り',
  [SeasonalEventType.SWIMMING_POOL]: '🏊 プール・海水浴',
  [SeasonalEventType.CHRISTMAS]: '🎄 クリスマス',
  [SeasonalEventType.CHERRY_BLOSSOM]: '🌸 桜・花見',
  [SeasonalEventType.AUTUMN_LEAVES]: '🍁 紅葉',
  [SeasonalEventType.SUMMER_FESTIVAL]: '🏮 夏祭り',
  [SeasonalEventType.WINTER_ILLUMINATION]: '✨ イルミネーション'
}

export default function FilterPanel() {
  const { filters, setFilters } = useSpotStore()

  // 永続化（ローカル）
  useEffect(() => {
    try {
      const saved = localStorage.getItem('spot_filters')
      if (saved) {
        setFilters(JSON.parse(saved))
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('spot_filters', JSON.stringify(filters))
    } catch {}
  }, [filters])

  const clearAll = () => setFilters({})
  // SpotList からのリセット要求
  useEffect(() => {
    const handler = () => clearAll()
    window.addEventListener('filters:clear', handler as any)
    return () => window.removeEventListener('filters:clear', handler as any)
  }, [])

  // 適用中フィルタのバッジ表示
  const activeBadges = useMemo(() => {
    const badges: { key: string; label: string; onClear: () => void }[] = []
    filters.category?.forEach((c) => badges.push({
      key: `cat-${c}`,
      label: `カテゴリ: ${categoryLabels[c]}`,
      onClear: () => setFilters({ ...filters, category: filters.category!.filter(x => x !== c) })
    }))
    filters.priceRange?.forEach((p) => badges.push({
      key: `price-${p}`,
      label: `価格: ${priceRangeLabels[p]}`,
      onClear: () => setFilters({ ...filters, priceRange: filters.priceRange!.filter(x => x !== p) })
    }))
    const flags: Array<[keyof SearchFilters, string]> = [
      ['hasKidsMenu', 'キッズメニュー'],
      ['hasHighChair', 'ハイチェア'],
      ['hasNursingRoom', '授乳室'],
      ['isStrollerFriendly', 'ベビーカーOK'],
      ['hasDiaperChanging', 'おむつ交換台'],
      ['hasPlayArea', 'キッズスペース'],
      ['isIndoor', '屋内'],
      ['isOutdoor', '屋外'],
      ['isFree', '無料'],
      ['hasParking', '駐車場'],
      ['hasPrivateRoom', '個室'],
      ['hasTatamiSeating', '座敷'],
      ['showOnlyShizuoka', '静岡のみ'],
      ['showTrending', 'トレンド優先'],
    ]
    flags.forEach(([k, label]) => {
      if (filters[k]) badges.push({ key: `flag-${String(k)}`, label, onClear: () => setFilters({ ...filters, [k]: undefined }) as any })
    })
    if (filters.ageGroup) badges.push({ key: 'age', label: `年齢: ${filters.ageGroup}`, onClear: () => setFilters({ ...filters, ageGroup: undefined }) })
    if (filters.minChildScore) badges.push({ key: 'score', label: `子連れ適性≥${filters.minChildScore}`, onClear: () => setFilters({ ...filters, minChildScore: undefined }) })
    if (filters.radius) badges.push({ key: 'radius', label: `範囲: ${filters.radius}km`, onClear: () => setFilters({ ...filters, radius: undefined }) })
    if (filters.sortBy) badges.push({ key: 'sort', label: `並び: ${filters.sortBy}`, onClear: () => setFilters({ ...filters, sortBy: undefined }) })
    if (filters.seasonalEvent) badges.push({ key: 'season', label: `季節: ${seasonalEventLabels[filters.seasonalEvent]}`, onClear: () => setFilters({ ...filters, seasonalEvent: undefined }) })
    return badges
  }, [filters, setFilters])

  const handleCategoryChange = (category: SpotCategory, checked: boolean) => {
    const currentCategories = filters.category || []
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category)
    
    setFilters({ ...filters, category: newCategories })
  }

  const handlePriceRangeChange = (priceRange: PriceRange, checked: boolean) => {
    const currentPriceRanges = filters.priceRange || []
    const newPriceRanges = checked
      ? [...currentPriceRanges, priceRange]
      : currentPriceRanges.filter(p => p !== priceRange)
    
    setFilters({ ...filters, priceRange: newPriceRanges })
  }

  const handleFacilityChange = (facility: keyof SearchFilters, checked: boolean) => {
    setFilters({ ...filters, [facility]: checked })
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 sticky top-4">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
        🔧 検索フィルター
      </h2>

      {/* 適用中フィルタのバッジ */}
      <div className="mb-3 flex flex-wrap gap-2">
        {activeBadges.map(({ key, label, onClear }) => (
          <Badge key={key} onClear={onClear}>{label}</Badge>
        ))}
        {activeBadges.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} aria-label="フィルターを全てクリア">
            クリア
          </Button>
        )}
      </div>
      
      <div className="space-y-4 md:space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">カテゴリ</h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1 md:gap-2">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <label key={value} className="flex items-center touch-none">
                <input
                  type="checkbox"
                  checked={filters.category?.includes(value as SpotCategory) || false}
                  onChange={(e) => handleCategoryChange(value as SpotCategory, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
                />
                <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">価格帯</h3>
          <div className="grid grid-cols-1 gap-1 md:gap-2">
            {Object.entries(priceRangeLabels).map(([value, label]) => (
              <label key={value} className="flex items-center touch-none">
                <input
                  type="checkbox"
                  checked={filters.priceRange?.includes(value as PriceRange) || false}
                  onChange={(e) => handlePriceRangeChange(value as PriceRange, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
                />
                <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">子連れ向け設備</h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1 md:gap-2">
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasKidsMenu || false}
                onChange={(e) => handleFacilityChange('hasKidsMenu', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">キッズメニュー</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasHighChair || false}
                onChange={(e) => handleFacilityChange('hasHighChair', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">ハイチェア</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasNursingRoom || false}
                onChange={(e) => handleFacilityChange('hasNursingRoom', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">授乳室</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.isStrollerFriendly || false}
                onChange={(e) => handleFacilityChange('isStrollerFriendly', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">ベビーカー対応</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasDiaperChanging || false}
                onChange={(e) => handleFacilityChange('hasDiaperChanging', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">おむつ交換台</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasPlayArea || false}
                onChange={(e) => handleFacilityChange('hasPlayArea', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">キッズスペース</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">対象年齢</h3>
          <select
            value={filters.ageGroup || ''}
            onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value as 'baby' | 'toddler' | 'child' || undefined })}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
          >
            <option value="">全年齢</option>
            <option value="baby">👶 赤ちゃん (0-2歳)</option>
            <option value="toddler">🧒 幼児 (2-5歳)</option>
            <option value="child">👦 小学生 (5-12歳)</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">子連れ適性</h3>
          <select
            value={filters.minChildScore || 30}
            onChange={(e) => setFilters({ ...filters, minChildScore: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
          >
            <option value={0}>すべて表示</option>
            <option value={30}>30点以上</option>
            <option value={50}>50点以上 (推奨)</option>
            <option value={70}>70点以上 (高評価)</option>
            <option value={90}>90点以上 (最高評価)</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">検索範囲</h3>
          <select
            value={filters.radius || 5}
            onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
          >
            <option value={1}>1km以内</option>
            <option value={3}>3km以内</option>
            <option value={5}>5km以内</option>
            <option value={10}>10km以内</option>
            <option value={20}>20km以内</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">並び替え</h3>
          <select
            value={filters.sortBy || 'popularity'}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'popularity' | 'rating' | 'recent' })}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
          >
            <option value="popularity">🔥 人気順</option>
            <option value="rating">⭐ 評価順</option>
            <option value="recent">🆕 新着順</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">静岡エリア</h3>
          <div className="space-y-2">
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.showOnlyShizuoka || false}
                onChange={(e) => setFilters({ ...filters, showOnlyShizuoka: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">静岡県内のみ表示</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.showTrending || false}
                onChange={(e) => setFilters({ ...filters, showTrending: e.target.checked })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">トレンドスポットを優先</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">季節イベント</h3>
          <select
            value={filters.seasonalEvent || ''}
            onChange={(e) => setFilters({ ...filters, seasonalEvent: e.target.value as SeasonalEventType || undefined })}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
          >
            <option value="">すべて表示</option>
            {Object.entries(seasonalEventLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">施設タイプ</h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.isIndoor || false}
                onChange={(e) => setFilters({ ...filters, isIndoor: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4"
              />
              <span className="ml-2 text-xs text-gray-700 select-none">🏢 屋内</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.isOutdoor || false}
                onChange={(e) => setFilters({ ...filters, isOutdoor: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 w-4 h-4"
              />
              <span className="ml-2 text-xs text-gray-700 select-none">🌳 屋外</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">料金・設備</h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.isFree || false}
                onChange={(e) => setFilters({ ...filters, isFree: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 w-4 h-4"
              />
              <span className="ml-2 text-xs text-gray-700 select-none">💰 無料</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasParking || false}
                onChange={(e) => setFilters({ ...filters, hasParking: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4"
              />
              <span className="ml-2 text-xs text-gray-700 select-none">🚗 駐車場</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasPrivateRoom || false}
                onChange={(e) => setFilters({ ...filters, hasPrivateRoom: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-4 h-4"
              />
              <span className="ml-2 text-xs text-gray-700 select-none">🏠 個室</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasTatamiSeating || false}
                onChange={(e) => setFilters({ ...filters, hasTatamiSeating: e.target.checked })}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-2 w-4 h-4"
              />
              <span className="ml-2 text-xs text-gray-700 select-none">🥢 座敷</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
