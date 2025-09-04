'use client'

import { useEffect, useRef, useState } from 'react'
import { useSpotStore } from '@/lib/stores/useSpotStore'

declare global {
  interface Window { L?: any }
}

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.L) return resolve()

    // CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => {
      // Load markercluster plugin (best-effort)
      const mcCss1 = document.createElement('link')
      mcCss1.rel = 'stylesheet'
      mcCss1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css'
      document.head.appendChild(mcCss1)
      const mcCss2 = document.createElement('link')
      mcCss2.rel = 'stylesheet'
      mcCss2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css'
      document.head.appendChild(mcCss2)
      const mc = document.createElement('script')
      mc.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'
      mc.async = true
      mc.onload = () => resolve()
      mc.onerror = () => resolve()
      document.body.appendChild(mc)
    }
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.body.appendChild(script)
  })
}

interface MapViewProps { region: string; prefecture: string }

export default function MapView({ region, prefecture }: MapViewProps) {
  const { spots, searchSpotsInBBox } = useSpotStore()
  const mapRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    loadLeaflet().then(() => setReady(true)).catch(() => setReady(false))
  }, [])

  useEffect(() => {
    if (!ready || !mapRef.current || !window.L) return
    const L = window.L

    // Initialize map
    const centerSpot = spots.find(s => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    const initialLat = centerSpot?.latitude ?? 35.0
    const initialLon = centerSpot?.longitude ?? 138.38
    const map = L.map(mapRef.current).setView([initialLat, initialLon], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const validSpots = spots.filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    const normalIcon = L.divIcon({ className: 'leaflet-div-icon', html: '<div style="background:#4f46e5;color:#fff;border-radius:12px;padding:2px 6px;font-size:12px;">●</div>' })
    const activeIcon = L.divIcon({ className: 'leaflet-div-icon', html: '<div style="background:#dc2626;color:#fff;border-radius:12px;padding:2px 6px;font-size:12px;">●</div>' })
    const cluster = L.markerClusterGroup ? L.markerClusterGroup() : null
    const markerMap: Record<string, any> = {}
    const store = require('@/lib/stores/useSpotStore').useSpotStore
    const { setHighlightedSpot, setActiveSpot } = store.getState()

    validSpots.forEach((s: any) => {
      const m = L.marker([s.latitude, s.longitude], { icon: normalIcon })
      m.on('mouseover', () => setHighlightedSpot(s.id))
      m.on('mouseout', () => setHighlightedSpot(undefined))
      m.on('click', () => setActiveSpot(s.id))
      m.bindPopup(`<b>${s.name}</b><br/>${s.address}`)
      markerMap[s.id] = m
      if (cluster) cluster.addLayer(m); else m.addTo(map)
    })
    if (cluster) cluster.addTo(map)

    // Fit bounds if we have several points
    if (validSpots.length > 1) {
      const latlngs = validSpots.map(s => [s.latitude as number, s.longitude as number])
      map.fitBounds(latlngs as any, { padding: [20, 20] })
    }

    // bbox fetch on moveend
    const onMoveEnd = () => {
      const b = map.getBounds()
      const minLat = b.getSouth()
      const maxLat = b.getNorth()
      const minLon = b.getWest()
      const maxLon = b.getEast()
      const bbox: [number, number, number, number] = [minLon, minLat, maxLon, maxLat]
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
      debounceRef.current = window.setTimeout(() => {
        searchSpotsInBBox(region, prefecture, bbox)
      }, 400)
    }
    map.on('moveend', onMoveEnd)

    // Sync active selection -> marker icon
    const unsubscribe = store.subscribe((state: any) => state.activeSpotId, (id: string | undefined) => {
      Object.entries(markerMap).forEach(([sid, m]) => m.setIcon(sid === id ? activeIcon : normalIcon))
    })

    return () => { map.off('moveend', onMoveEnd); if (cluster) cluster.clearLayers(); unsubscribe(); map.remove() }
  }, [ready, spots])

  return (
    <div className="surface radius elevate-md p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">🗺️ 地図ビュー（β）</h2>
      <div ref={mapRef} className="w-full h-[60vh] rounded-md" />
      {(!spots || spots.length === 0) && (
        <p className="text-sm text-gray-500 mt-2">検索後にスポットが地図に表示されます</p>
      )}
    </div>
  )
}
