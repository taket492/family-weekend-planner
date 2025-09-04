import { SearchFilters } from '@/types'

export function serializeFiltersToQuery(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category?.length) params.set('categories', filters.category.join(','))
  if (filters.priceRange?.length) params.set('priceRanges', filters.priceRange.join(','))
  if (filters.hasKidsMenu) params.set('hasKidsMenu', 'true')
  if (filters.hasHighChair) params.set('hasHighChair', 'true')
  if (filters.hasNursingRoom) params.set('hasNursingRoom', 'true')
  if (filters.isStrollerFriendly) params.set('isStrollerFriendly', 'true')
  if (filters.hasDiaperChanging) params.set('hasDiaperChanging', 'true')
  if (filters.hasPlayArea) params.set('hasPlayArea', 'true')
  if ((filters as any).isIndoor) params.set('isIndoor', 'true')
  if ((filters as any).isOutdoor) params.set('isOutdoor', 'true')
  if ((filters as any).isFree) params.set('isFree', 'true')
  if ((filters as any).hasParking) params.set('hasParking', 'true')
  if ((filters as any).hasPrivateRoom) params.set('hasPrivateRoom', 'true')
  if ((filters as any).hasTatamiSeating) params.set('hasTatamiSeating', 'true')
  if (filters.ageGroup) params.set('ageGroup', filters.ageGroup)
  if (filters.minChildScore) params.set('minChildScore', String(filters.minChildScore))
  if (filters.radius) params.set('radius', String(filters.radius))
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.showOnlyShizuoka) params.set('showOnlyShizuoka', 'true')
  if (filters.showTrending) params.set('showTrending', 'true')
  if ((filters as any).seasonalEvent) params.set('seasonalEvent', String((filters as any).seasonalEvent))
  if ((filters as any).isOpen) params.set('isOpen', 'true')
  return params
}

export function parseFiltersFromQuery(search: string): Partial<SearchFilters> {
  const sp = new URLSearchParams(search)
  const getBool = (k: string) => sp.get(k) === 'true'
  const filters: Partial<SearchFilters> = {}
  const cats = sp.get('categories')
  if (cats) (filters as any).category = cats.split(',')
  const prs = sp.get('priceRanges')
  if (prs) (filters as any).priceRange = prs.split(',')
  if (sp.get('ageGroup')) filters.ageGroup = sp.get('ageGroup') as any
  if (sp.get('minChildScore')) filters.minChildScore = parseInt(sp.get('minChildScore') || '0')
  if (sp.get('radius')) filters.radius = parseInt(sp.get('radius') || '0')
  if (sp.get('sortBy')) filters.sortBy = sp.get('sortBy') as any
  ;['hasKidsMenu','hasHighChair','hasNursingRoom','isStrollerFriendly','hasDiaperChanging','hasPlayArea','isIndoor','isOutdoor','isFree','hasParking','hasPrivateRoom','hasTatamiSeating','showOnlyShizuoka','showTrending','isOpen','seasonalEvent'].forEach(k => {
    if (sp.has(k)) (filters as any)[k] = k==='seasonalEvent' ? sp.get(k) : getBool(k)
  })
  return filters
}

