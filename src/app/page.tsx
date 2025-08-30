'use client'

import { useState } from 'react'
import LocationSelector from '@/components/LocationSelector'
import SpotList from '@/components/SpotList'
import FilterPanel from '@/components/FilterPanel'
import PlanBuilder from '@/components/PlanBuilder'

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number
    longitude: number
    address: string
  } | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            家族週末プランナー
          </h1>
          <p className="text-gray-600 mt-1">
            子連れ向けのお出かけスポットを見つけてプランを作成しましょう
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <LocationSelector 
              onLocationSelect={setSelectedLocation}
            />
            
            {selectedLocation && (
              <FilterPanel />
            )}
          </div>
          
          <div className="lg:col-span-1">
            {selectedLocation && (
              <SpotList 
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
              />
            )}
          </div>
          
          <div className="lg:col-span-1">
            <PlanBuilder />
          </div>
        </div>
      </main>
    </div>
  )
}
