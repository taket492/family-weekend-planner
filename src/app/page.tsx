'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import LocationSelector from '@/components/LocationSelector'
import SpotList from '@/components/SpotList'
import MapView from '@/components/MapView'
import FilterPanel from '@/components/FilterPanel'
import WeeklyRanking from '@/components/WeeklyRanking'
import EventList from '@/components/EventList'
import { ManualSpotForm } from '@/components/ManualSpotForm'
import { ManualRestaurantForm } from '@/components/ManualRestaurantForm'
import { RecentSpots } from '@/components/RecentSpots'
import ProfilePanel from '@/components/ProfilePanel'
import TemplateGenerator from '@/components/TemplateGenerator'
import PlanBuilder from '@/components/PlanBuilder'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import UrlImportPanel from '@/components/UrlImportPanel'
import { useSpotStore } from '@/lib/stores/useSpotStore'
import { parseFiltersFromQuery, serializeFiltersToQuery } from '@/lib/url-filters'

function AuthControls() {
  const { user, signIn, signOut } = useAuthStore()
  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <span className="text-sm text-gray-700">こんにちは、{user.name}</span>
          <Button size="sm" variant="secondary" onClick={signOut}>サインアウト</Button>
        </>
      ) : (
        <Button size="sm" onClick={() => signIn('ゲスト')}>サインイン</Button>
      )}
    </div>
  )
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{
    region: string
    prefecture: string
    address: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'add-spot' | 'add-restaurant'>('search')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  
  // Load from URL on mount
  const { filters, setFilters } = useSpotStore()
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search)
      const region = sp.get('region')
      const prefecture = sp.get('prefecture')
      if (region && prefecture) {
        setSelectedLocation({ region, prefecture, address: `${prefecture}${region}` })
      }
      const parsed = parseFiltersFromQuery(location.search)
      if (Object.keys(parsed).length) setFilters({ ...filters, ...parsed })
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync URL when location/filters change
  useEffect(() => {
    const url = new URL(location.href)
    url.search = ''
    if (selectedLocation) {
      url.searchParams.set('region', selectedLocation.region)
      url.searchParams.set('prefecture', selectedLocation.prefecture)
    }
    const params = serializeFiltersToQuery(filters as any)
    params.forEach((v,k)=>url.searchParams.set(k,v))
    history.replaceState(null, '', url.toString())
  }, [selectedLocation, filters])

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ファミリースポット検索
              </h1>
              <p className="text-gray-600 mt-1">
                子連れ向けのお出かけスポットを簡単に見つけよう
              </p>
            </div>
            {/* Mock Auth Controls */}
            <AuthControls />
          </div>
          
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
                <ProfilePanel />
                <div className="hidden lg:block">
                  <FilterPanel />
                </div>
                <div className="lg:hidden">
                  <Button variant="secondary" size="sm" onClick={() => setShowFilters(true)}>🔧 フィルターを開く</Button>
                </div>
              </div>
              
              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center gap-2">
                  <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>📄 リスト</Button>
                  <Button variant={viewMode === 'map' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('map')}>🗺️ 地図</Button>
                </div>
                {viewMode === 'map' ? (
                  <MapView region={selectedLocation.region} prefecture={selectedLocation.prefecture} />
                ) : (
                  <SpotList 
                    region={selectedLocation.region}
                    prefecture={selectedLocation.prefecture}
                  />
                )}
                <TemplateGenerator />
                <PlanBuilder />
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
            <UrlImportPanel />
            <ManualRestaurantForm />
          </div>
        )}
      </main>
    </div>
    {/* モバイル用フィルタードロワー */}
    {showFilters && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
        <div className="absolute right-0 top-0 h-full w-5/6 max-w-sm bg-white shadow-xl p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold">検索フィルター</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>閉じる</Button>
          </div>
          <FilterPanel />
        </div>
      </div>
    )}
    </>
  )
}
