'use client'

import { useState } from 'react'
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
            <nav className="-mb-px flex flex-wrap gap-2 sm:space-x-8 sm:gap-0">
              <button
                onClick={() => setActiveTab('search')}
                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-sm rounded-t-md ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔍 スポット検索
              </button>
              
              <button
                onClick={() => setActiveTab('add-spot')}
                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-sm rounded-t-md ${
                  activeTab === 'add-spot'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 スポット登録
              </button>
              
              <button
                onClick={() => setActiveTab('add-restaurant')}
                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-sm rounded-t-md ${
                  activeTab === 'add-restaurant'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🍽️ レストラン登録
              </button>
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
