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
    script.onload = () => resolve()
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

    if (validSpots.length > 50) {
      // Simple grid-based clustering (approximate)
      const clusters: Record<string, { count: number; latSum: number; lonSum: number; names: string[] }> = {}
      for (const s of validSpots) {
        const key = `${(s.latitude as number).toFixed(2)}_${(s.longitude as number).toFixed(2)}`
        clusters[key] ||= { count: 0, latSum: 0, lonSum: 0, names: [] }
        clusters[key].count++
        clusters[key].latSum += s.latitude as number
        clusters[key].lonSum += s.longitude as number
        if (clusters[key].names.length < 5) clusters[key].names.push(s.name)
      }
      Object.values(clusters).forEach(c => {
        const lat = c.latSum / c.count
        const lon = c.lonSum / c.count
        const marker = L.marker([lat, lon], {
          icon: L.divIcon({
            className: 'leaflet-div-icon',
            html: `<div style="background:#4f46e5;color:#fff;border-radius:20px;padding:2px 8px;font-size:12px;">${c.count}</div>`,
            iconSize: [30, 24],
            iconAnchor: [15, 12]
          })
        })
        marker.addTo(map).bindPopup(`${c.count}件\n${c.names.join('、')}`)
      })
    } else {
      validSpots.forEach(s => {
        const m = L.marker([s.latitude as number, s.longitude as number]).addTo(map)
        m.bindPopup(`<b>${s.name}</b><br/>${s.address}`)
      })
    }

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

    return () => { map.off('moveend', onMoveEnd); map.remove() }
  }, [ready, spots])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ 地図ビュー（β）</h2>
      <div ref={mapRef} className="w-full h-[60vh] rounded-md" />
      {(!spots || spots.length === 0) && (
        <p className="text-sm text-gray-500 mt-2">検索後にスポットが地図に表示されます</p>
      )}
    </div>
  )
}
