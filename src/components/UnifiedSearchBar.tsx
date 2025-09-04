'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import SegmentedControl from '@/components/ui/SegmentedControl'
import { Input } from '@/components/ui/Input'
import { useSpotStore } from '@/lib/stores/useSpotStore'
import LocationSelector from '@/components/LocationSelector'
import { Collapse } from '@/components/ui/Collapse'

type Mode = 'area' | 'nearby'

function bboxFrom(lat: number, lon: number, radiusKm: number): [number, number, number, number] {
  const earthRadiusKm = 6371
  const dLat = (radiusKm / earthRadiusKm) * (180 / Math.PI)
  const dLon = (radiusKm / (earthRadiusKm * Math.cos((Math.PI * lat) / 180))) * (180 / Math.PI)
  return [lon - dLon, lat - dLat, lon + dLon, lat + dLat]
}

interface Props {
  selectedLocation: { region: string; prefecture: string; address: string } | null
  onLocationSelect: (loc: { region: string; prefecture: string; address: string }) => void
}

export default function UnifiedSearchBar({ selectedLocation, onLocationSelect }: Props) {
  const { filters, setFilters, setBbox } = useSpotStore()
  const [mode, setMode] = useState<Mode>('area')
  const [keyword, setKeyword] = useState(filters.keyword || '')
  const [radius, setRadius] = useState<number>(5)
  const [locError, setLocError] = useState<string | null>(null)
  const [showAreaPicker, setShowAreaPicker] = useState<boolean>(false)

  useEffect(() => { setKeyword(filters.keyword || '') }, [filters.keyword])

  const submitKeyword = useCallback(() => {
    setFilters({ ...filters, keyword: keyword.trim() || undefined })
  }, [filters, keyword, setFilters])

  const applyOuting = useCallback(() => {
    // When nearby, set bbox; when area, clear bbox (use selected location)
    if (mode === 'nearby') {
      if (!('geolocation' in navigator)) {
        setLocError('ブラウザが現在地取得に対応していません')
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocError(null)
          const { latitude, longitude } = pos.coords
          const box = bboxFrom(latitude, longitude, radius)
          setBbox(box)
        },
        (err) => {
          setLocError('現在地を取得できませんでした（許可設定をご確認ください）')
          console.warn('Geolocation error', err)
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    } else {
      setBbox(undefined)
    }
  }, [mode, radius, setBbox])

  return (
    <div className="surface radius elevate-md p-4 md:p-5">
      {/* 1) キーワード検索 */}
      <div>
        <label className="text-xs text-gray-500">キーワード検索</label>
        <div className="mt-1 flex items-center gap-2">
          <Input
            value={keyword}
            onChange={(e)=>setKeyword(e.target.value)}
            placeholder="例: 公園、授乳室、ベビーカーOK"
            onKeyDown={(e)=>{ if (e.key==='Enter') submitKeyword() }}
            aria-label="キーワードでスポットを検索"
          />
          <Button onClick={submitKeyword} aria-label="キーワードで検索">検索</Button>
        </div>
      </div>

      {/* 2) お出かけ設定（分離・折りたたみ） */}
      <div className="mt-4">
        <Collapse title="お出かけ設定（エリア・現在地）">
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 mt-2">
            <div className="md:w-[260px]">
              <label className="text-xs text-gray-500">モード</label>
              <div className="mt-1">
                <SegmentedControl
                  value={mode}
                  onChange={(v)=>setMode(v)}
                  options={[
                    { value: 'area', label: 'エリア選択' },
                    { value: 'nearby', label: '現在地周辺' },
                  ]}
                />
              </div>
            </div>
            {mode === 'area' ? (
              <div className="flex-1">
                <label className="text-xs text-gray-500">エリア</label>
                <div className="mt-1 flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={()=>setShowAreaPicker(!showAreaPicker)}>
                    {selectedLocation ? `📍 ${selectedLocation.prefecture} ${selectedLocation.region}` : '📍 エリアを選択'}
                  </Button>
                  {selectedLocation && (
                    <span className="text-xs text-gray-500">選択済み</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <label className="text-xs text-gray-500">検索範囲</label>
                <div className="mt-1 flex items-center gap-2">
                  <select className="border rounded-md px-2 py-1 text-sm" value={radius} onChange={(e)=>setRadius(parseInt(e.target.value))} aria-label="検索範囲 (km)">
                    {[2,5,10,20].map(km=> <option key={km} value={km}>{km}km</option>)}
                  </select>
                  <Button variant="secondary" size="sm" onClick={applyOuting} aria-label="現在地周辺で検索">適用</Button>
                </div>
              </div>
            )}
            <div className="md:w-[160px]">
              {mode === 'area' && (
                <Button className="w-full" onClick={()=>setBbox(undefined)} aria-label="エリア設定を適用">適用</Button>
              )}
            </div>
          </div>
          {locError && <p className="mt-2 text-xs text-red-600">{locError}</p>}
          {mode === 'area' && showAreaPicker && (
            <div className="mt-3">
              <LocationSelector onLocationSelect={(loc)=>{ onLocationSelect(loc); setShowAreaPicker(false) }} />
            </div>
          )}
        </Collapse>
      </div>
    </div>
  )
}
