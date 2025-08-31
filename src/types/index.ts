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
  
  // 静岡特化機能
  region?: string
  isShizuokaSpot?: boolean
  weeklyRank?: number
  popularityScore?: number
  seasonalRecommendation?: SeasonalRecommendation
  events?: Event[]
  distance?: number
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
  sortBy?: 'distance' | 'popularity' | 'rating' | 'recent'
  region?: string
  showOnlyShizuoka?: boolean
  showTrending?: boolean
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
  updatedAt?: Date
}

// 新しい型定義
export interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  location?: string
  spotId?: string
  isChildFriendly: boolean
  category: EventCategory
  registrationRequired?: boolean
  maxParticipants?: number
  price?: number
}

export enum EventCategory {
  FESTIVAL = 'FESTIVAL',
  WORKSHOP = 'WORKSHOP',
  EXHIBITION = 'EXHIBITION',
  SEASONAL = 'SEASONAL',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL'
}

export interface SeasonalRecommendation {
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  reason: string
  bestMonths: number[]
  specialFeatures: string[]
}

export interface Bookmark {
  id: string
  userId: string
  spotId: string
  notes?: string
  tags?: string[]
  createdAt: Date
}

export interface Restaurant extends Spot {
  cuisine: CuisineType[]
  hasKidsChair: boolean
  hasKidsMenu: boolean
  hasDiaperChangingTable: boolean
  hasNursingRoom: boolean
  acceptsReservations: boolean
  kidsFriendlyRating: number
  averageMealTime: number
  smokingPolicy: 'non_smoking' | 'smoking_section' | 'smoking_allowed'
}

export enum CuisineType {
  JAPANESE = 'JAPANESE',
  ITALIAN = 'ITALIAN',
  CHINESE = 'CHINESE',
  FRENCH = 'FRENCH',
  AMERICAN = 'AMERICAN',
  KOREAN = 'KOREAN',
  FAST_FOOD = 'FAST_FOOD',
  FAMILY_RESTAURANT = 'FAMILY_RESTAURANT',
  BUFFET = 'BUFFET'
}