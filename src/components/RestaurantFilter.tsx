'use client'

import { CuisineType, PriceRange } from '@/types'

interface RestaurantFilters {
  cuisine: CuisineType[]
  priceRange: PriceRange[]
  hasKidsChair: boolean
  hasKidsMenu: boolean
  hasDiaperChangingTable: boolean
  hasNursingRoom: boolean
  acceptsReservations: boolean
  minKidsFriendlyRating: number
  radius: number
}

interface RestaurantFilterProps {
  filters: RestaurantFilters
  onFiltersChange: (filters: RestaurantFilters) => void
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

export default function RestaurantFilter({ filters, onFiltersChange }: RestaurantFilterProps) {
  const handleCuisineChange = (cuisine: CuisineType, checked: boolean) => {
    const newCuisine = checked
      ? [...filters.cuisine, cuisine]
      : filters.cuisine.filter(c => c !== cuisine)
    
    onFiltersChange({ ...filters, cuisine: newCuisine })
  }

  const handlePriceRangeChange = (priceRange: PriceRange, checked: boolean) => {
    const newPriceRange = checked
      ? [...filters.priceRange, priceRange]
      : filters.priceRange.filter(p => p !== priceRange)
    
    onFiltersChange({ ...filters, priceRange: newPriceRange })
  }

  const handleFacilityChange = (facility: keyof RestaurantFilters, checked: boolean) => {
    onFiltersChange({ ...filters, [facility]: checked })
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 sticky top-4">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
        🍽️ レストランフィルター
      </h2>
      
      <div className="space-y-4 md:space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">料理ジャンル</h3>
          <div className="grid grid-cols-1 gap-1 md:gap-2">
            {Object.entries(cuisineLabels).map(([value, label]) => (
              <label key={value} className="flex items-center touch-none">
                <input
                  type="checkbox"
                  checked={filters.cuisine.includes(value as CuisineType)}
                  onChange={(e) => handleCuisineChange(value as CuisineType, e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
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
                  checked={filters.priceRange.includes(value as PriceRange)}
                  onChange={(e) => handlePriceRangeChange(value as PriceRange, e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
                />
                <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">子供向け設備</h3>
          <div className="grid grid-cols-1 gap-1 md:gap-2">
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasKidsChair}
                onChange={(e) => handleFacilityChange('hasKidsChair', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">子供用椅子</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasKidsMenu}
                onChange={(e) => handleFacilityChange('hasKidsMenu', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">キッズメニュー</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasDiaperChangingTable}
                onChange={(e) => handleFacilityChange('hasDiaperChangingTable', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">おむつ交換台</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.hasNursingRoom}
                onChange={(e) => handleFacilityChange('hasNursingRoom', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">授乳室</span>
            </label>
            
            <label className="flex items-center touch-none">
              <input
                type="checkbox"
                checked={filters.acceptsReservations}
                onChange={(e) => handleFacilityChange('acceptsReservations', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 w-4 h-4 md:w-auto md:h-auto"
              />
              <span className="ml-2 text-xs md:text-sm text-gray-700 select-none">予約可能</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">子連れ評価</h3>
          <select
            value={filters.minKidsFriendlyRating}
            onChange={(e) => onFiltersChange({ ...filters, minKidsFriendlyRating: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
          >
            <option value={0}>すべて表示</option>
            <option value={3}>3.0以上</option>
            <option value={4}>4.0以上 (推奨)</option>
            <option value={4.5}>4.5以上 (高評価)</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">検索範囲</h3>
          <select
            value={filters.radius}
            onChange={(e) => onFiltersChange({ ...filters, radius: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
          >
            <option value={1}>1km以内</option>
            <option value={3}>3km以内</option>
            <option value={5}>5km以内</option>
            <option value={10}>10km以内</option>
          </select>
        </div>
      </div>
    </div>
  )
}
