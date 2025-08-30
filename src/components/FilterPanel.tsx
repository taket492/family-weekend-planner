'use client'

import { useSpotStore } from '@/lib/stores/useSpotStore'
import { SpotCategory, PriceRange, SearchFilters } from '@/types'

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

export default function FilterPanel() {
  const { filters, setFilters } = useSpotStore()

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
      </div>
    </div>
  )
}