import { Spot } from '@/types'

const EARTH_R = 6371 // km

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_R * c
}

export type TravelMode = 'walk' | 'drive'

export function estimateTravelTimeHours(distanceKm: number, mode: TravelMode): number {
  // Simple averages; no traffic
  const speed = mode === 'walk' ? 5 : 30 // km/h
  return distanceKm / speed
}

export function optimizeOrder(spots: Spot[]): Spot[] {
  if (spots.length <= 2) return spots
  const hasCoords = (s: Spot) => typeof s.latitude === 'number' && typeof s.longitude === 'number'
  const allHave = spots.every(hasCoords)
  if (!allHave) return spots // fallback: do not reorder when coordinates missing

  const remaining = spots.slice()
  const route: Spot[] = []
  // Start from first
  let current = remaining.shift() as Spot
  route.push(current)
  while (remaining.length) {
    let bestIdx = 0
    let bestDist = Number.POSITIVE_INFINITY
    for (let i = 0; i < remaining.length; i++) {
      const s = remaining[i]
      const d = haversine(current.latitude as number, current.longitude as number, s.latitude as number, s.longitude as number)
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    }
    current = remaining.splice(bestIdx, 1)[0]
    route.push(current)
  }
  return route
}

export function computeSegments(spots: Spot[]): { distanceKm: number; hours: number }[] {
  const segments: { distanceKm: number; hours: number }[] = []
  for (let i = 0; i < spots.length - 1; i++) {
    const a = spots[i]
    const b = spots[i + 1]
    if (typeof a.latitude === 'number' && typeof a.longitude === 'number' && typeof b.latitude === 'number' && typeof b.longitude === 'number') {
      const d = haversine(a.latitude, a.longitude, b.latitude, b.longitude)
      segments.push({ distanceKm: d, hours: 0 })
    } else {
      // Unknown distance when coords missing
      segments.push({ distanceKm: 0, hours: 0 })
    }
  }
  return segments
}
