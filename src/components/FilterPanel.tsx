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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        フィルター
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">カテゴリ</h3>
          <div className="space-y-2">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.category?.includes(value as SpotCategory) || false}
                  onChange={(e) => handleCategoryChange(value as SpotCategory, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">価格帯</h3>
          <div className="space-y-2">
            {Object.entries(priceRangeLabels).map(([value, label]) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.priceRange?.includes(value as PriceRange) || false}
                  onChange={(e) => handlePriceRangeChange(value as PriceRange, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">子連れ向け設備</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasKidsMenu || false}
                onChange={(e) => handleFacilityChange('hasKidsMenu', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">キッズメニュー</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasHighChair || false}
                onChange={(e) => handleFacilityChange('hasHighChair', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">ハイチェア</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasNursingRoom || false}
                onChange={(e) => handleFacilityChange('hasNursingRoom', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">授乳室</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isStrollerFriendly || false}
                onChange={(e) => handleFacilityChange('isStrollerFriendly', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">ベビーカー対応</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasDiaperChanging || false}
                onChange={(e) => handleFacilityChange('hasDiaperChanging', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">おむつ交換台</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasPlayArea || false}
                onChange={(e) => handleFacilityChange('hasPlayArea', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">キッズスペース</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">検索範囲</h3>
          <select
            value={filters.radius || 5}
            onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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