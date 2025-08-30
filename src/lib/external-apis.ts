import { SpotCategory } from '@/types'

interface OverpassElement {
  type: string
  id: number
  lat?: number
  lon?: number
  tags: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

// OpenStreetMapのタグから子連れ向け設備を判定
function parseChildFriendlyFeatures(tags: Record<string, string>) {
  return {
    hasKidsMenu: tags.kids_menu === 'yes' || tags.menu === 'kids',
    hasHighChair: tags.highchair === 'yes' || tags.high_chair === 'yes',
    hasNursingRoom: tags.baby_feeding === 'yes' || tags.nursing_room === 'yes',
    isStrollerFriendly: tags.wheelchair === 'yes' || tags.stroller === 'yes',
    hasDiaperChanging: tags.changing_table === 'yes' || tags.baby_changing === 'yes',
    hasPlayArea: tags.playground === 'yes' || tags.leisure === 'playground'
  }
}

// OSMカテゴリからアプリカテゴリにマッピング
function mapToSpotCategory(tags: Record<string, string>): SpotCategory {
  const amenity = tags.amenity
  const leisure = tags.leisure
  const tourism = tags.tourism
  const shop = tags.shop

  if (amenity === 'restaurant' || amenity === 'fast_food') return SpotCategory.RESTAURANT
  if (amenity === 'cafe' || amenity === 'bar') return SpotCategory.CAFE
  if (leisure === 'playground' || amenity === 'playground') return SpotCategory.PLAYGROUND
  if (leisure === 'park') return SpotCategory.PARK
  if (tourism === 'museum' || amenity === 'museum') return SpotCategory.MUSEUM
  if (shop || amenity === 'marketplace') return SpotCategory.SHOPPING
  if (leisure === 'amusement_arcade' || amenity === 'cinema') return SpotCategory.ENTERTAINMENT
  if (tourism === 'attraction' || tourism === 'viewpoint') return SpotCategory.TOURIST_SPOT

  return SpotCategory.RESTAURANT // デフォルト
}

export async function searchNearbySpots(
  latitude: number,
  longitude: number,
  radius: number = 5000 // メートル
) {
  try {
    // Overpass APIクエリ（レストラン、カフェ、公園、遊び場など）
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"~"^(restaurant|cafe|fast_food|playground|museum)$"](around:${radius},${latitude},${longitude});
        way["amenity"~"^(restaurant|cafe|fast_food|playground|museum)$"](around:${radius},${latitude},${longitude});
        node["leisure"~"^(playground|park)$"](around:${radius},${latitude},${longitude});
        way["leisure"~"^(playground|park)$"](around:${radius},${latitude},${longitude});
        node["tourism"~"^(museum|attraction)$"](around:${radius},${latitude},${longitude});
        way["tourism"~"^(museum|attraction)$"](around:${radius},${latitude},${longitude});
        node["shop"](around:${radius},${latitude},${longitude});
        way["shop"](around:${radius},${latitude},${longitude});
      );
      out center meta;
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    })

    if (!response.ok) {
      throw new Error('Overpass API request failed')
    }

    const data: OverpassResponse = await response.json()

    // データを変換
    const spots = data.elements
      .filter(element => element.lat && element.lon && element.tags.name)
      .map(element => {
        const childFeatures = parseChildFriendlyFeatures(element.tags)
        
        return {
          id: `osm-${element.type}-${element.id}`,
          name: element.tags.name || '名称不明',
          description: element.tags.description || element.tags.note,
          category: mapToSpotCategory(element.tags),
          address: [
            element.tags['addr:full'],
            element.tags['addr:street'],
            element.tags['addr:city'],
            element.tags['addr:postcode']
          ].filter(Boolean).join(' ') || '住所不明',
          latitude: element.lat!,
          longitude: element.lon!,
          
          ...childFeatures,
          
          phoneNumber: element.tags.phone || element.tags['contact:phone'],
          website: element.tags.website || element.tags['contact:website'],
          openingHours: element.tags.opening_hours,
          
          rating: element.tags.rating ? parseFloat(element.tags.rating) : null,
          reviewCount: 0,
          
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      .slice(0, 50) // 最大50件に制限

    return spots
  } catch (error) {
    console.error('Error fetching spots from OSM:', error)
    throw error
  }
}