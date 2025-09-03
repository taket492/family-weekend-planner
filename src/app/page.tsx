'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import LocationSelector from '@/components/LocationSelector'
import SpotList from '@/components/SpotList'
import FilterPanel from '@/components/FilterPanel'
import WeeklyRanking from '@/components/WeeklyRanking'
import EventList from '@/components/EventList'
import { ManualSpotForm } from '@/components/ManualSpotForm'
import { ManualRestaurantForm } from '@/components/ManualRestaurantForm'
import { RecentSpots } from '@/components/RecentSpots'

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{
    region: string
    prefecture: string
    address: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'add-spot' | 'add-restaurant'>('search')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            ファミリースポット検索
          </h1>
          <p className="text-gray-600 mt-1">
            子連れ向けのお出かけスポットを簡単に見つけよう
          </p>
          
          {/* ナビゲーションタブ */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-2 sm:space-x-2">
              <Button
                variant={activeTab === 'search' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('search')}
              >
                🔍 スポット検索
              </Button>
              <Button
                variant={activeTab === 'add-spot' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('add-spot')}
              >
                📝 スポット登録
              </Button>
              <Button
                variant={activeTab === 'add-restaurant' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('add-restaurant')}
              >
                🍽️ レストラン登録
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' ? (
          !selectedLocation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <LocationSelector 
                  onLocationSelect={setSelectedLocation}
                />
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <RecentSpots />
                <WeeklyRanking />
                <EventList />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <LocationSelector 
                  onLocationSelect={setSelectedLocation}
                />
                <FilterPanel />
              </div>
              
              <div className="lg:col-span-3 space-y-6">
                <SpotList 
                  region={selectedLocation.region}
                  prefecture={selectedLocation.prefecture}
                />
                <EventList 
                  region={selectedLocation.region}
                  prefecture={selectedLocation.prefecture}
                />
              </div>
            </div>
          )
        ) : activeTab === 'add-spot' ? (
          <div className="max-w-4xl mx-auto">
            <ManualSpotForm />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ManualRestaurantForm />
          </div>
        )}
      </main>
    </div>
  )
}
