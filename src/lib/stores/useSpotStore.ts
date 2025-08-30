import { create } from 'zustand'
import { Spot, SearchFilters } from '@/types'

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
  setFilters: (filters: SearchFilters) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  searchSpots: (latitude: number, longitude: number) => Promise<void>
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
  
  setFilters: (filters) => set({ filters }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  searchSpots: async (latitude: number, longitude: number) => {
    const { filters } = get()
    set({ isLoading: true, error: null })
    
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: (filters.radius || 5).toString()
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

      const response = await fetch(`/api/spots?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch spots')
      }
      
      const spots = await response.json()
      set({ spots, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  }
}))