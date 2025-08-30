export interface Spot {
  id: string
  name: string
  description?: string
  category: SpotCategory
  address: string
  latitude: number
  longitude: number
  
  hasKidsMenu: boolean
  hasHighChair: boolean
  hasNursingRoom: boolean
  isStrollerFriendly: boolean
  hasDiaperChanging: boolean
  hasPlayArea: boolean
  
  phoneNumber?: string
  website?: string
  openingHours?: string
  priceRange?: PriceRange
  
  rating?: number
  reviewCount: number
  
  // Social media and review URLs
  tabelogUrl?: string
  gurunaviUrl?: string
  rettyUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  
  // Trending status
  isTrending?: boolean
  trendingSource?: 'instagram' | 'twitter' | 'tabelog' | 'gurunavi'
}

export interface Plan {
  id: string
  title: string
  description?: string
  date: Date
  region: string
  spots: PlanSpot[]
}

export interface CreatePlanData {
  title: string
  description?: string
  date: Date
  region: string
  spots: {
    spotId: string
    order: number
    visitTime: Date | null
    notes: string | null
  }[]
}

export interface PlanSpot {
  id: string
  planId: string
  spotId: string
  order: number
  visitTime?: Date
  notes?: string
  spot: Spot
}

export enum SpotCategory {
  RESTAURANT = 'RESTAURANT',
  CAFE = 'CAFE',
  PLAYGROUND = 'PLAYGROUND',
  PARK = 'PARK',
  MUSEUM = 'MUSEUM',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  TOURIST_SPOT = 'TOURIST_SPOT'
}

export enum PriceRange {
  BUDGET = 'BUDGET',
  MODERATE = 'MODERATE',
  EXPENSIVE = 'EXPENSIVE'
}

export interface SearchFilters {
  category?: SpotCategory[]
  priceRange?: PriceRange[]
  hasKidsMenu?: boolean
  hasHighChair?: boolean
  hasNursingRoom?: boolean
  isStrollerFriendly?: boolean
  hasDiaperChanging?: boolean
  hasPlayArea?: boolean
  radius?: number // km
  ageGroup?: 'baby' | 'toddler' | 'child'
  minChildScore?: number
}

// Extended Spot interface for API responses
export interface ExtendedSpot extends Spot {
  childFriendlyScore?: number
  ageAppropriate?: {
    baby: number
    toddler: number
    child: number
  }
  crowdLevel?: string
  isCurrentlyOpen?: boolean
  todayHours?: string
  source?: string
}