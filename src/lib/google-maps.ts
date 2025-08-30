// Google Maps API統合ライブラリ
// 注意: Google Maps APIは有料サービスです。利用には適切なAPIキーが必要です。

import { SpotCategory } from '@/types'

interface GooglePlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  user_ratings_total?: number
  price_level?: number
  types: string[]
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
}

export class GoogleMapsService {
  private static apiKey: string = process.env.GOOGLE_MAPS_API_KEY || ''
  
  // Places API - 近隣検索（高精度）
  static async searchNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number = 5000,
    type?: string
  ): Promise<GooglePlace[]> {
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured. Using fallback OpenStreetMap.')
      return []
    }

    try {
      const types = type || 'restaurant|cafe|amusement_park|tourist_attraction|park'
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${types}&key=${this.apiKey}&language=ja`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === 'OK') {
        return data.results as GooglePlace[]
      } else {
        console.error('Google Places API error:', data.status)
        return []
      }
    } catch (error) {
      console.error('Google Maps API error:', error)
      return []
    }
  }

  // Place Details API - 詳細情報取得
  static async getPlaceDetails(placeId: string) {
    if (!this.apiKey) return null

    try {
      const fields = 'name,formatted_address,geometry,rating,user_ratings_total,price_level,opening_hours,website,formatted_phone_number,photos,reviews'
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}&language=ja`
      
      const response = await fetch(url)
      const data = await response.json()
      
      return data.status === 'OK' ? data.result : null
    } catch (error) {
      console.error('Place details error:', error)
      return null
    }
  }

  // Google Maps Places APIからSpotオブジェクトに変換
  static convertGooglePlaceToSpot(place: GooglePlace, childFriendlyScore: number = 60) {
    return {
      id: `google-${place.place_id}`,
      name: place.name,
      description: `Google Maps掲載スポット`,
      category: this.mapGoogleTypeToCategory(place.types),
      address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      
      // 基本設備（Google APIからは詳細取得困難、推定値）
      hasKidsMenu: place.types.includes('restaurant') && place.rating && place.rating >= 4.0,
      hasHighChair: place.types.includes('restaurant'),
      hasNursingRoom: place.types.includes('shopping_mall'),
      isStrollerFriendly: true, // Google Placesの多くはアクセシブル
      hasDiaperChanging: place.types.includes('shopping_mall') || place.types.includes('restaurant'),
      hasPlayArea: place.types.includes('amusement_park') || place.types.includes('park'),
      
      website: null, // Place Details APIで取得可能
      openingHours: place.opening_hours?.weekday_text?.join(', '),
      rating: place.rating,
      reviewCount: place.user_ratings_total || 0,
      
      // 拡張情報
      childFriendlyScore,
      isCurrentlyOpen: place.opening_hours?.open_now || false,
      source: 'Google Maps',
      
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // Google Places typesをアプリカテゴリにマッピング
  static mapGoogleTypeToCategory(types: string[]) {
    
    if (types.includes('restaurant') || types.includes('meal_takeaway')) return SpotCategory.RESTAURANT
    if (types.includes('cafe')) return SpotCategory.CAFE
    if (types.includes('amusement_park') || types.includes('playground')) return SpotCategory.PLAYGROUND
    if (types.includes('park')) return SpotCategory.PARK
    if (types.includes('museum')) return SpotCategory.MUSEUM
    if (types.includes('shopping_mall') || types.includes('store')) return SpotCategory.SHOPPING
    if (types.includes('movie_theater') || types.includes('bowling_alley')) return SpotCategory.ENTERTAINMENT
    if (types.includes('tourist_attraction')) return SpotCategory.TOURIST_SPOT
    
    return SpotCategory.TOURIST_SPOT
  }

  // APIキー設定確認
  static isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0
  }

  // 使用量とコスト見積もり
  static estimateCost(requests: number): { jpy: number; usd: number } {
    // 2024年時点のGoogle Maps API料金（参考値）
    // Places API: $17 per 1,000 requests
    const usdCost = (requests / 1000) * 17
    const jpyCost = usdCost * 150 // 概算レート
    
    return { jpy: Math.round(jpyCost), usd: Math.round(usdCost * 100) / 100 }
  }
}

// 環境変数設定ガイド
export const GOOGLE_MAPS_SETUP_GUIDE = `
Google Maps API設定手順:

1. Google Cloud Consoleでプロジェクト作成
2. Places API、Maps JavaScript APIを有効化
3. APIキーを作成し、適切な制限を設定
4. 環境変数に設定:
   GOOGLE_MAPS_API_KEY=your_api_key_here

5. 料金について:
   - Places API: 1,000リクエスト = $17 (約2,550円)
   - 月1,000件まで無料クレジットあり
   - 予算制限の設定を推奨

注意: 本アプリは現在OpenStreetMapを使用（無料）
Google Maps APIは精度向上のオプション機能として利用可能
`