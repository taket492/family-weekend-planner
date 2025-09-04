import { create } from 'zustand'
import { Spot, SearchFilters } from '@/types'
import { useProfileStore, ageToBucket } from './useProfileStore'

interface SpotStore {
  spots: Spot[]
  selectedSpots: Spot[]
  filters: SearchFilters
  isLoading: boolean
  error: string | null
  
  setSpots: (spots: Spot[]) => void
  addSelectedSpot: (spot: Spot) => void
  removeSelectedSpot: (spotId: string) => void
  clearSelectedSpots: () => void
  reorderSelectedSpots: (spots: Spot[]) => void
  setSelectedSpots: (spots: Spot[]) => void
  setFilters: (filters: SearchFilters) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  searchSpots: (region: string, prefecture: string) => Promise<void>
  searchSpotsInBBox: (region: string, prefecture: string, bbox: [number, number, number, number]) => Promise<void>
}

export const useSpotStore = create<SpotStore>((set, get) => ({
  spots: [],
  selectedSpots: [],
  filters: {},
  isLoading: false,
  error: null,

  setSpots: (spots) => set({ spots }),
  
  addSelectedSpot: (spot) => set(state => ({
    selectedSpots: [...state.selectedSpots, spot]
  })),
  
  removeSelectedSpot: (spotId) => set(state => ({
    selectedSpots: state.selectedSpots.filter(spot => spot.id !== spotId)
  })),
  
  clearSelectedSpots: () => set({ selectedSpots: [] }),
  
  reorderSelectedSpots: (spots) => set({ selectedSpots: spots }),
  setSelectedSpots: (spots) => set({ selectedSpots: spots }),
  
  setFilters: (filters) => set({ filters }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  searchSpots: async (region: string, prefecture: string) => {
    const { filters } = get()
    set({ isLoading: true, error: null })
    
    try {
      const params = new URLSearchParams({
        region: region,
        prefecture: prefecture
      })

      if (filters.category?.length) {
        params.append('categories', filters.category.join(','))
      }
      
      if (filters.priceRange?.length) {
        params.append('priceRanges', filters.priceRange.join(','))
      }

      // 子連れ向けフィルター
      if (filters.hasKidsMenu) params.append('hasKidsMenu', 'true')
      if (filters.hasHighChair) params.append('hasHighChair', 'true')
      if (filters.hasNursingRoom) params.append('hasNursingRoom', 'true')
      if (filters.isStrollerFriendly) params.append('isStrollerFriendly', 'true')
      if (filters.hasDiaperChanging) params.append('hasDiaperChanging', 'true')
      if (filters.hasPlayArea) params.append('hasPlayArea', 'true')

      // 拡張フィルター
      if (filters.ageGroup) params.append('ageGroup', filters.ageGroup)
      if (filters.minChildScore) params.append('minChildScore', filters.minChildScore.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.showOnlyShizuoka) params.append('showOnlyShizuoka', 'true')
      if (filters.showTrending) params.append('showTrending', 'true')

      // 外部APIから実際のスポットデータを取得
      const response = await fetch(`/api/spots/external?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch spots from external API')
      }
      
      let spots: Spot[] = await response.json()

      // Apply family profile weighted sort (client-side)
      try {
        const { children } = useProfileStore.getState()
        if (children.length && spots.length) {
          const weights: Record<'baby' | 'toddler' | 'child', number> = { baby: 0, toddler: 0, child: 0 }
          for (const c of children) {
            weights[ageToBucket(c)] += 1
          }
          const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1
          // Normalize
          Object.keys(weights).forEach(k => { weights[k as keyof typeof weights] /= total })

          spots = spots.slice().sort((a: any, b: any) => {
            const score = (s: any) => {
              const ap = s.ageAppropriate || { baby: 0, toddler: 0, child: 0 }
              return ap.baby * weights.baby + ap.toddler * weights.toddler + ap.child * weights.child
            }
            return score(b) - score(a)
          })
        }
      } catch {}

      set({ spots, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  }
  ,
  searchSpotsInBBox: async (region: string, prefecture: string, bbox: [number, number, number, number]) => {
    const { filters } = get()
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams({ region, prefecture })
      if (filters.category?.length) params.append('categories', filters.category.join(','))
      if (filters.priceRange?.length) params.append('priceRanges', filters.priceRange.join(','))
      if (filters.hasKidsMenu) params.append('hasKidsMenu', 'true')
      if (filters.hasHighChair) params.append('hasHighChair', 'true')
      if (filters.hasNursingRoom) params.append('hasNursingRoom', 'true')
      if (filters.isStrollerFriendly) params.append('isStrollerFriendly', 'true')
      if (filters.hasDiaperChanging) params.append('hasDiaperChanging', 'true')
      if (filters.hasPlayArea) params.append('hasPlayArea', 'true')
      if (filters.ageGroup) params.append('ageGroup', filters.ageGroup)
      if (filters.minChildScore) params.append('minChildScore', String(filters.minChildScore))
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.showOnlyShizuoka) params.append('showOnlyShizuoka', 'true')
      if (filters.showTrending) params.append('showTrending', 'true')
      params.append('bbox', `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`)

      const response = await fetch(`/api/spots/external?${params}`)
      if (!response.ok) throw new Error('Failed to fetch bbox spots')
      let spots: Spot[] = await response.json()
      // Apply profile-based weighting (reuse logic)
      try {
        const { children } = require('./useProfileStore').useProfileStore.getState()
        const { ageToBucket } = require('./useProfileStore')
        if (children.length && spots.length) {
          const weights: Record<'baby' | 'toddler' | 'child', number> = { baby: 0, toddler: 0, child: 0 }
          for (const c of children) weights[ageToBucket(c)] += 1
          const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1
          Object.keys(weights).forEach(k => { weights[k as keyof typeof weights] /= total })
          spots = spots.slice().sort((a: any, b: any) => {
            const score = (s: any) => {
              const ap = s.ageAppropriate || { baby: 0, toddler: 0, child: 0 }
              return ap.baby * weights.baby + ap.toddler * weights.toddler + ap.child * weights.child
            }
            return score(b) - score(a)
          })
        }
      } catch {}
      set({ spots, isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
    }
  }
}))
