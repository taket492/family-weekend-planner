"use client"

import { useSpotStore } from '@/lib/stores/useSpotStore'
import { SpotCategory, PriceRange, SearchFilters, SeasonalEventType } from '@/types'
import { useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Select } from '@/components/ui/Select'
import { Collapse } from '@/components/ui/Collapse'

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
          <Collapse title="カテゴリ">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1 md:gap-2 mt-1">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <Checkbox
                key={value}
                checked={filters.category?.includes(value as SpotCategory) || false}
                onChange={(e) => handleCategoryChange(value as SpotCategory, (e.target as HTMLInputElement).checked)}
                label={<span className="text-xs md:text-sm">{label}</span>}
              />
            ))}
          </div>
          </Collapse>
        </div>

        <div>
          <Collapse title="価格帯">
          <div className="grid grid-cols-1 gap-1 md:gap-2 mt-1">
            {Object.entries(priceRangeLabels).map(([value, label]) => (
              <Checkbox
                key={value}
                checked={filters.priceRange?.includes(value as PriceRange) || false}
                onChange={(e) => handlePriceRangeChange(value as PriceRange, (e.target as HTMLInputElement).checked)}
                label={<span className="text-xs md:text-sm">{label}</span>}
              />
            ))}
          </div>
          </Collapse>
        </div>

        <div>
          <Collapse title="子連れ向け設備">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1 md:gap-2 mt-1">
            <Checkbox checked={filters.hasKidsMenu || false} onChange={(e) => handleFacilityChange('hasKidsMenu', (e.target as HTMLInputElement).checked)} label={<span className="text-xs md:text-sm">キッズメニュー</span>} />
            <Checkbox checked={filters.hasHighChair || false} onChange={(e) => handleFacilityChange('hasHighChair', (e.target as HTMLInputElement).checked)} label={<span className="text-xs md:text-sm">ハイチェア</span>} />
            <Checkbox checked={filters.hasNursingRoom || false} onChange={(e) => handleFacilityChange('hasNursingRoom', (e.target as HTMLInputElement).checked)} label={<span className="text-xs md:text-sm">授乳室</span>} />
            <Checkbox checked={filters.isStrollerFriendly || false} onChange={(e) => handleFacilityChange('isStrollerFriendly', (e.target as HTMLInputElement).checked)} label={<span className="text-xs md:text-sm">ベビーカー対応</span>} />
            <Checkbox checked={filters.hasDiaperChanging || false} onChange={(e) => handleFacilityChange('hasDiaperChanging', (e.target as HTMLInputElement).checked)} label={<span className="text-xs md:text-sm">おむつ交換台</span>} />
            <Checkbox checked={filters.hasPlayArea || false} onChange={(e) => handleFacilityChange('hasPlayArea', (e.target as HTMLInputElement).checked)} label={<span className="text-xs md:text-sm">キッズスペース</span>} />
          </div>
          </Collapse>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">対象年齢</h3>
          <Select
            value={filters.ageGroup || ''}
            onChange={(e) => setFilters({ ...filters, ageGroup: (e.target as HTMLSelectElement).value as 'baby' | 'toddler' | 'child' || undefined })}
          >
            <option value="">全年齢</option>
            <option value="baby">👶 赤ちゃん (0-2歳)</option>
            <option value="toddler">🧒 幼児 (2-5歳)</option>
            <option value="child">👦 小学生 (5-12歳)</option>
          </Select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">子連れ適性</h3>
          <Select
            value={filters.minChildScore || 30}
            onChange={(e) => setFilters({ ...filters, minChildScore: parseInt((e.target as HTMLSelectElement).value) })}
          >
            <option value={0}>すべて表示</option>
            <option value={30}>30点以上</option>
            <option value={50}>50点以上 (推奨)</option>
            <option value={70}>70点以上 (高評価)</option>
            <option value={90}>90点以上 (最高評価)</option>
          </Select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">検索範囲</h3>
          <Select
            value={filters.radius || 5}
            onChange={(e) => setFilters({ ...filters, radius: parseInt((e.target as HTMLSelectElement).value) })}
          >
            <option value={1}>1km以内</option>
            <option value={3}>3km以内</option>
            <option value={5}>5km以内</option>
            <option value={10}>10km以内</option>
            <option value={20}>20km以内</option>
          </Select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">並び替え</h3>
          <Select
            value={filters.sortBy || 'popularity'}
            onChange={(e) => setFilters({ ...filters, sortBy: (e.target as HTMLSelectElement).value as 'popularity' | 'rating' | 'recent' })}
          >
            <option value="popularity">🔥 人気順</option>
            <option value="rating">⭐ 評価順</option>
            <option value="recent">🆕 新着順</option>
          </Select>
        </div>

        <div>
          <Collapse title="静岡エリア">
          <div className="space-y-2 mt-1">
            <Checkbox checked={filters.showOnlyShizuoka || false} onChange={(e) => setFilters({ ...filters, showOnlyShizuoka: (e.target as HTMLInputElement).checked })} label={<span className="text-xs md:text-sm">静岡県内のみ表示</span>} />
            <Checkbox checked={filters.showTrending || false} onChange={(e) => setFilters({ ...filters, showTrending: (e.target as HTMLInputElement).checked })} label={<span className="text-xs md:text-sm">トレンドスポットを優先</span>} />
          </div>
          </Collapse>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">季節イベント</h3>
          <Select
            value={filters.seasonalEvent || ''}
            onChange={(e) => setFilters({ ...filters, seasonalEvent: (e.target as HTMLSelectElement).value as SeasonalEventType || undefined })}
          >
            <option value="">すべて表示</option>
            {Object.entries(seasonalEventLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>

        <div>
          <Collapse title="施設タイプ">
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Checkbox checked={filters.isIndoor || false} onChange={(e) => setFilters({ ...filters, isIndoor: (e.target as HTMLInputElement).checked })} label={<span className="text-xs">🏢 屋内</span>} />
            <Checkbox checked={filters.isOutdoor || false} onChange={(e) => setFilters({ ...filters, isOutdoor: (e.target as HTMLInputElement).checked })} label={<span className="text-xs">🌳 屋外</span>} />
          </div>
          </Collapse>
        </div>

        <div>
          <Collapse title="料金・設備">
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Checkbox checked={filters.isFree || false} onChange={(e) => setFilters({ ...filters, isFree: (e.target as HTMLInputElement).checked })} label={<span className="text-xs">💰 無料</span>} />
            <Checkbox checked={filters.hasParking || false} onChange={(e) => setFilters({ ...filters, hasParking: (e.target as HTMLInputElement).checked })} label={<span className="text-xs">🚗 駐車場</span>} />
            <Checkbox checked={filters.hasPrivateRoom || false} onChange={(e) => setFilters({ ...filters, hasPrivateRoom: (e.target as HTMLInputElement).checked })} label={<span className="text-xs">🏠 個室</span>} />
            <Checkbox checked={filters.hasTatamiSeating || false} onChange={(e) => setFilters({ ...filters, hasTatamiSeating: (e.target as HTMLInputElement).checked })} label={<span className="text-xs">🥢 座敷</span>} />
          </div>
          </Collapse>
        </div>
      </div>
    </div>
  )
}
