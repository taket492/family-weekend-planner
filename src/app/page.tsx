'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import SegmentedControl from '@/components/ui/SegmentedControl'
import LocationSelector from '@/components/LocationSelector'
import SpotList from '@/components/SpotList'
import MapView from '@/components/MapView'
import FilterPanel from '@/components/FilterPanel'
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
import UnifiedSearchBar from '@/components/UnifiedSearchBar'
import MobileActionBar from '@/components/MobileActionBar'

function AuthControls() {
  const { user, signIn, signOut } = useAuthStore()
  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <span className="text-sm text-gray-600">こんにちは、{user.name}</span>
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

  // Listen command palette global events
  useEffect(() => {
    const openFilters = () => setShowFilters(true)
    const setKeyword = (e: Event) => {
      const detail = (e as CustomEvent).detail as any
      if (detail?.keyword) {
        setFilters({ ...filters, keyword: String(detail.keyword) })
      }
    }
    const toList = () => setViewMode('list')
    const toMap = () => setViewMode('map')
    const tabSearch = () => setActiveTab('search')
    const tabAddSpot = () => setActiveTab('add-spot')
    const tabAddRestaurant = () => setActiveTab('add-restaurant')
    window.addEventListener('filters:open', openFilters)
    window.addEventListener('filters:keyword', setKeyword as any)
    window.addEventListener('view:list', toList)
    window.addEventListener('view:map', toMap)
    window.addEventListener('cmdk:tab:search', tabSearch)
    window.addEventListener('cmdk:tab:add-spot', tabAddSpot)
    window.addEventListener('cmdk:tab:add-restaurant', tabAddRestaurant)
    return () => {
      window.removeEventListener('filters:open', openFilters)
      window.removeEventListener('filters:keyword', setKeyword as any)
      window.removeEventListener('view:list', toList)
      window.removeEventListener('view:map', toMap)
      window.removeEventListener('cmdk:tab:search', tabSearch)
      window.removeEventListener('cmdk:tab:add-spot', tabAddSpot)
      window.removeEventListener('cmdk:tab:add-restaurant', tabAddRestaurant)
    }
  }, [])

  return (
    <>
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="surface radius elevate-md p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 size-40 rounded-full bg-[color-mix(in_oklab,var(--brand),white_80%)] opacity-20" />
          <div className="absolute -left-10 bottom-0 size-56 rounded-full bg-[color-mix(in_oklab,var(--accent),white_85%)] opacity-20" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">ファミリースポット検索</h1>
                <p className="text-gray-600 mt-1">子連れ向けのお出かけスポットを簡単に見つけよう</p>
              </div>
              <div className="hidden sm:block"><AuthControls /></div>
            </div>
            <div className="mt-4">
              <SegmentedControl
                value={activeTab}
                onChange={(v)=>setActiveTab(v)}
                options={[
                  { value: 'search', label: '🔍 スポット検索' },
                  { value: 'add-spot', label: '📝 スポット登録' },
                  { value: 'add-restaurant', label: '🍽️ レストラン登録' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'search' ? (
          <div className="space-y-6">
            <UnifiedSearchBar selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
            <div className="space-y-6">
              <SegmentedControl
                value={viewMode}
                onChange={(v)=>setViewMode(v)}
                options={[
                  { value: 'list', label: '📄 リスト' },
                  { value: 'map', label: '🗺️ 地図' },
                ]}
              />
              {viewMode === 'map' ? (
                <MapView region={selectedLocation?.region || '静岡市'} prefecture={selectedLocation?.prefecture || '静岡県'} />
              ) : (
                <SpotList 
                  region={selectedLocation?.region}
                  prefecture={selectedLocation?.prefecture}
                />
              )}
            </div>
            <TemplateGenerator />
            <PlanBuilder />
            <EventList 
              region={selectedLocation?.region}
              prefecture={selectedLocation?.prefecture}
            />
          </div>
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
        <div className="absolute right-0 top-0 h-full w-5/6 max-w-sm surface elevate-lg p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold">検索フィルター</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>閉じる</Button>
          </div>
          <FilterPanel />
        </div>
      </div>
    )}
    {/* Mobile action bar */}
    {activeTab === 'search' && selectedLocation && (
      <MobileActionBar
        viewMode={viewMode}
        onToggleView={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        onOpenFilters={() => setShowFilters(true)}
      />
    )}
    </>
  )
}
