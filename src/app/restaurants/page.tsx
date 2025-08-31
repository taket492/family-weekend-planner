'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Restaurant, CuisineType, PriceRange } from '@/types'
import RestaurantCard from '@/components/RestaurantCard'
import RestaurantFilter from '@/components/RestaurantFilter'

function RestaurantsContent() {
  const searchParams = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    cuisine: [] as CuisineType[],
    priceRange: [] as PriceRange[],
    hasKidsChair: false,
    hasKidsMenu: false,
    hasDiaperChangingTable: false,
    hasNursingRoom: false,
    acceptsReservations: false,
    minKidsFriendlyRating: 0,
    radius: 5
  })

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const spotName = searchParams.get('spotName')

  useEffect(() => {
    if (lat && lng) {
      searchRestaurants(parseFloat(lat), parseFloat(lng))
    }
  }, [lat, lng, filters])

  const searchRestaurants = async (latitude: number, longitude: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: filters.radius.toString()
      })

      if (filters.cuisine.length) {
        params.append('cuisine', filters.cuisine.join(','))
      }
      if (filters.priceRange.length) {
        params.append('priceRange', filters.priceRange.join(','))
      }
      if (filters.hasKidsChair) params.append('hasKidsChair', 'true')
      if (filters.hasKidsMenu) params.append('hasKidsMenu', 'true')
      if (filters.hasDiaperChangingTable) params.append('hasDiaperChangingTable', 'true')
      if (filters.hasNursingRoom) params.append('hasNursingRoom', 'true')
      if (filters.acceptsReservations) params.append('acceptsReservations', 'true')
      if (filters.minKidsFriendlyRating > 0) params.append('minKidsFriendlyRating', filters.minKidsFriendlyRating.toString())

      const response = await fetch(`/api/restaurants?${params}`)
      if (!response.ok) throw new Error('レストラン検索に失敗しました')
      
      const data = await response.json()
      setRestaurants(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            子供向けレストラン検索
          </h1>
          {spotName && (
            <p className="text-gray-600 mt-1">
              {spotName} 周辺のファミリーレストラン
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <RestaurantFilter 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4"></div>
                  <p className="text-gray-600">子供向けレストランを検索中...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  🍽️ レストラン検索結果
                  <span className="text-lg font-normal text-gray-500 ml-3">
                    {restaurants.length}件見つかりました
                  </span>
                </h2>
                
                {restaurants.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-lg text-gray-500 mb-2">
                      条件に合うレストランが見つかりませんでした
                    </p>
                    <p className="text-gray-400">
                      フィルター条件を調整してみてください
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {restaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantsContent />
    </Suspense>
  )
}