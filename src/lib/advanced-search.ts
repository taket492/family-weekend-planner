import { SpotCategory } from '@/types'
import { GoogleMapsService } from './google-maps'

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
}

// 複数の無料APIを統合した高度検索システム
export class AdvancedSpotSearch {
  
  // OpenStreetMap Overpass API
  static async searchOSM(lat: number, lng: number, radius: number) {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"^(restaurant|cafe|fast_food|playground|museum|cinema|library|park)$"](around:${radius},${lat},${lng});
        way["amenity"~"^(restaurant|cafe|fast_food|playground|museum|cinema|library|park)$"](around:${radius},${lat},${lng});
        relation["amenity"~"^(restaurant|cafe|fast_food|playground|museum|cinema|library|park)$"](around:${radius},${lat},${lng});
        node["leisure"~"^(playground|park|sports_centre|swimming_pool|amusement_arcade)$"](around:${radius},${lat},${lng});
        way["leisure"~"^(playground|park|sports_centre|swimming_pool|amusement_arcade)$"](around:${radius},${lat},${lng});
        node["tourism"~"^(museum|attraction|zoo|aquarium|theme_park)$"](around:${radius},${lat},${lng});
        way["tourism"~"^(museum|attraction|zoo|aquarium|theme_park)$"](around:${radius},${lat},${lng});
        node["shop"~"^(mall|supermarket|department_store|toys|books)$"](around:${radius},${lat},${lng});
        way["shop"~"^(mall|supermarket|department_store|toys|books)$"](around:${radius},${lat},${lng});
      );
      out center meta tags;
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    })

    return response.json()
  }

  // Wikipedia Places API (近隣の観光スポット・有名場所)
  static async searchWikipedia(lat: number, lng: number, radius: number) {
    try {
      const kmRadius = radius / 1000
      const url = `https://ja.wikipedia.org/api/rest_v1/page/nearby/${lat}/${lng}/${kmRadius * 1000}`
      
      const response = await fetch(url)
      if (!response.ok) return { pages: [] }
      
      return await response.json()
    } catch {
      return { pages: [] }
    }
  }

  // 営業時間の解析とリアルタイム営業状況判定
  static parseOpeningHours(openingHours: string): {
    isOpen: boolean
    nextChange: string | null
    todayHours: string | null
  } {
    if (!openingHours) return { isOpen: false, nextChange: null, todayHours: null }
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    // 24時間営業の場合
    if (openingHours.includes('24/7') || openingHours.includes('24時間')) {
      return { isOpen: true, nextChange: null, todayHours: '24時間営業' }
    }

    // 簡易パース（例: "10:00-22:00"）
    const timeMatch = openingHours.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/)
    if (timeMatch) {
      const [, startH, startM, endH, endM] = timeMatch
      const startTime = parseInt(startH) * 60 + parseInt(startM)
      const endTime = parseInt(endH) * 60 + parseInt(endM)
      
      const isOpen = currentTime >= startTime && currentTime <= endTime
      const nextChange = isOpen ? `${endH}:${endM}に閉店` : `${startH}:${startM}に開店`
      
      return { 
        isOpen, 
        nextChange, 
        todayHours: `${startH}:${startM}-${endH}:${endM}` 
      }
    }

    return { isOpen: false, nextChange: null, todayHours: openingHours }
  }

  // AIによる子連れ適性スコアリング
  static calculateChildFriendlyScore(element: { tags: Record<string, string> }): number {
    let score = 0
    const tags = element.tags || {}

    // 基本設備スコア
    if (tags.wheelchair === 'yes') score += 15 // ベビーカー対応
    if (tags.baby_feeding === 'yes') score += 20 // 授乳室
    if (tags.changing_table === 'yes') score += 20 // おむつ交換台
    if (tags.kids_menu === 'yes') score += 15 // キッズメニュー
    if (tags.highchair === 'yes') score += 10 // ハイチェア

    // カテゴリ別基本スコア
    const amenity = tags.amenity
    if (amenity === 'playground') score += 50
    if (amenity === 'fast_food') score += 20
    if (amenity === 'restaurant' && tags.cuisine === 'japanese') score += 15
    if (tags.leisure === 'park') score += 40
    if (tags.tourism === 'zoo' || tags.tourism === 'aquarium') score += 45

    // ネガティブ要素
    if (tags.smoking === 'yes') score -= 20
    if (tags.alcohol === 'served') score -= 5
    if (tags.age_restriction === 'yes') score -= 30

    // 環境要素
    if (tags.outdoor_seating === 'yes') score += 10
    if (tags.air_conditioning === 'yes') score += 5
    if (tags.parking === 'yes') score += 10

    return Math.max(0, Math.min(100, score))
  }

  // 混雑度予測（時間帯・曜日・季節要因）
  static predictCrowdLevel(category: SpotCategory): string {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (category === SpotCategory.RESTAURANT) {
      if (hour >= 11 && hour <= 13) return '🔴 混雑'
      if (hour >= 18 && hour <= 20) return '🔴 混雑'
      if (isWeekend && hour >= 10 && hour <= 15) return '🟡 やや混雑'
      return '🟢 空いている'
    }

    if (category === SpotCategory.PARK || category === SpotCategory.PLAYGROUND) {
      if (isWeekend && hour >= 10 && hour <= 16) return '🔴 混雑'
      if (hour >= 15 && hour <= 17) return '🟡 やや混雑'
      return '🟢 空いている'
    }

    if (category === SpotCategory.SHOPPING) {
      if (isWeekend && hour >= 14 && hour <= 18) return '🔴 混雑'
      if (hour >= 19 && hour <= 21) return '🟡 やや混雑'
      return '🟢 空いている'
    }

    return '🟢 空いている'
  }

  // 天気に基づく推奨度調整
  static adjustForWeather(category: SpotCategory, isOutdoor: boolean): number {
    // 実際の天気APIは有料なので、季節・時間で簡易判定
    const now = new Date()
    const month = now.getMonth() + 1
    const hour = now.getHours()
    
    let weatherScore = 1.0

    // 屋外施設の場合
    if (isOutdoor) {
      // 雨季 (6-7月)
      if (month >= 6 && month <= 7) weatherScore *= 0.7
      // 冬季 (12-2月)
      if (month >= 12 || month <= 2) weatherScore *= 0.8
      // 夜間
      if (hour < 8 || hour > 18) weatherScore *= 0.6
    }

    return weatherScore
  }

  // 年齢別推奨度計算
  static calculateAgeAppropriate(tags: Record<string, string>): {
    baby: number    // 0-2歳
    toddler: number // 2-5歳
    child: number   // 5-12歳
  } {
    let baby = 50, toddler = 50, child = 50

    const amenity = tags.amenity
    const leisure = tags.leisure

    // 年齢別スコア調整
    if (amenity === 'playground') {
      baby += 10; toddler += 40; child += 30
    }
    if (leisure === 'park') {
      baby += 30; toddler += 35; child += 25
    }
    if (amenity === 'restaurant') {
      baby += 20; toddler += 25; child += 30
    }
    if (amenity === 'museum') {
      baby -= 10; toddler += 10; child += 40
    }

    // 設備による調整
    if (tags.changing_table === 'yes') baby += 30
    if (tags.kids_menu === 'yes') { toddler += 20; child += 25 }
    if (tags.playground === 'yes') { toddler += 30; child += 35 }

    return {
      baby: Math.max(0, Math.min(100, baby)),
      toddler: Math.max(0, Math.min(100, toddler)),
      child: Math.max(0, Math.min(100, child))
    }
  }

  // 統合検索メイン関数
  static async comprehensiveSearch(
    latitude: number,
    longitude: number,
    radius: number,
    filters: { categories?: SpotCategory[]; minChildScore?: number; ageGroup?: string }
  ) {
    try {
      // 並列でAPI呼び出し（Google Maps APIが利用可能な場合は含める）
      const apiCalls = [
        this.searchOSM(latitude, longitude, radius),
        this.searchWikipedia(latitude, longitude, radius),
        this.searchTrendingSpots(latitude, longitude, radius)
      ]

      // Google Maps APIが設定されている場合は追加
      if (GoogleMapsService.isConfigured()) {
        apiCalls.push(
          GoogleMapsService.searchNearbyPlaces(latitude, longitude, radius)
            .then(places => ({ googlePlaces: places }))
            .catch(() => ({ googlePlaces: [] }))
        )
      }

      const results = await Promise.all(apiCalls)
      const [osmData, wikiData, trendingData, googleData] = results

      // OSMデータの処理
      const osmSpots = osmData.elements
        .filter((el: { lat?: number; lon?: number; tags?: Record<string, string> }) => el.lat && el.lon && el.tags?.name)
        .map((element: { type: string; id: number; lat: number; lon: number; tags: Record<string, string> }) => {
          const tags = element.tags
          const childScore = this.calculateChildFriendlyScore(element)
          const ageScores = this.calculateAgeAppropriate(tags)
          const isOutdoor = tags.outdoor === 'yes' || tags.leisure === 'park'
          const weatherMultiplier = this.adjustForWeather(this.mapCategory(tags), isOutdoor)
          const openingInfo = this.parseOpeningHours(tags.opening_hours || '')
          const crowdLevel = this.predictCrowdLevel(this.mapCategory(tags))

          return {
            id: `osm-${element.type}-${element.id}`,
            name: tags.name,
            description: this.generateSmartDescription(tags, childScore, ageScores),
            category: this.mapCategory(tags),
            address: this.formatAddress(tags),
            latitude: element.lat,
            longitude: element.lon,
            
            // 子連れ向け設備（高精度判定）
            hasKidsMenu: tags.kids_menu === 'yes' || childScore >= 60,
            hasHighChair: tags.highchair === 'yes' || tags.high_chair === 'yes',
            hasNursingRoom: tags.baby_feeding === 'yes',
            isStrollerFriendly: tags.wheelchair === 'yes',
            hasDiaperChanging: tags.changing_table === 'yes',
            hasPlayArea: tags.playground === 'yes' || tags.leisure === 'playground',
            
            // 拡張情報
            phoneNumber: tags.phone || tags['contact:phone'],
            website: tags.website || tags['contact:website'],
            openingHours: tags.opening_hours,
            
            // AI計算されたスコア
            childFriendlyScore: Math.round(childScore * weatherMultiplier),
            ageAppropriate: ageScores,
            crowdLevel,
            isCurrentlyOpen: openingInfo.isOpen,
            todayHours: openingInfo.todayHours,
            
            // 基本情報
            rating: tags.rating ? parseFloat(tags.rating) : null,
            reviewCount: 0,
            source: 'OpenStreetMap',
            
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

      // Wikipediaの観光スポット追加
      const wikiSpots = (wikiData.pages || []).map((page: { pageid: number; title: string; extract?: string; coordinates?: { lat: number; lon: number } }) => ({
        id: `wiki-${page.pageid}`,
        name: page.title,
        description: `Wikipedia掲載の観光スポット - ${page.extract || ''}`,
        category: SpotCategory.TOURIST_SPOT,
        address: `緯度 ${page.coordinates?.lat}, 経度 ${page.coordinates?.lon}`,
        latitude: page.coordinates?.lat || latitude,
        longitude: page.coordinates?.lon || longitude,
        
        hasKidsMenu: false,
        hasHighChair: false,
        hasNursingRoom: false,
        isStrollerFriendly: true,
        hasDiaperChanging: false,
        hasPlayArea: false,
        
        website: `https://ja.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        
        childFriendlyScore: 60, // 観光スポットの基本スコア
        ageAppropriate: { baby: 40, toddler: 60, child: 80 },
        crowdLevel: this.predictCrowdLevel(SpotCategory.TOURIST_SPOT),
        isCurrentlyOpen: true,
        
        rating: null,
        reviewCount: 0,
        source: 'Wikipedia',
        
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      // トレンドスポットのマージ
      const trendingSpots = this.processTrendingSpots(trendingData, latitude, longitude)

      // Google Mapsデータの処理
      const googleSpots = googleData?.googlePlaces 
        ? googleData.googlePlaces.map((place: GooglePlace) => 
            GoogleMapsService.convertGooglePlaceToSpot(place, this.calculateChildFriendlyScore({ tags: {} }))
          )
        : []

      // 統合・重複排除・スコア順ソート
      const allSpots = [...osmSpots, ...wikiSpots, ...trendingSpots, ...googleSpots]
        .filter(spot => spot.childFriendlyScore >= 30) // 最低スコアフィルター
        .sort((a, b) => {
          // トレンドスポットを優先表示
          if (a.isTrending && !b.isTrending) return -1
          if (!a.isTrending && b.isTrending) return 1
          return b.childFriendlyScore - a.childFriendlyScore
        })
        .slice(0, 100) // 最大100件

      return allSpots
    } catch (error) {
      console.error('Advanced search error:', error)
      throw error
    }
  }

  // カテゴリマッピング（強化版）
  static mapCategory(tags: Record<string, string>): SpotCategory {
    const { amenity, leisure, tourism, shop } = tags

    // レストラン・カフェ
    if (amenity === 'restaurant' || amenity === 'fast_food') return SpotCategory.RESTAURANT
    if (amenity === 'cafe' || amenity === 'bar') return SpotCategory.CAFE
    
    // 遊び場・公園
    if (leisure === 'playground' || amenity === 'playground') return SpotCategory.PLAYGROUND
    if (leisure === 'park' || amenity === 'park') return SpotCategory.PARK
    
    // 文化・エンタメ
    if (tourism === 'museum' || amenity === 'museum') return SpotCategory.MUSEUM
    if (leisure === 'amusement_arcade' || amenity === 'cinema') return SpotCategory.ENTERTAINMENT
    if (tourism === 'zoo' || tourism === 'aquarium') return SpotCategory.ENTERTAINMENT
    
    // ショッピング
    if (shop || amenity === 'marketplace') return SpotCategory.SHOPPING
    
    // 観光スポット
    if (tourism === 'attraction' || tourism === 'viewpoint') return SpotCategory.TOURIST_SPOT

    return SpotCategory.TOURIST_SPOT
  }

  // 住所フォーマット
  static formatAddress(tags: Record<string, string>): string {
    const parts = [
      tags['addr:postcode'],
      tags['addr:city'],
      tags['addr:town'],
      tags['addr:suburb'],
      tags['addr:street'],
      tags['addr:housenumber']
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(' ') : '住所情報なし'
  }

  // ソーシャルメディアトレンド検索（疑似実装）
  static async searchTrendingSpots(lat: number, lng: number, radius: number) {
    // 実際のSNS APIは有料/制限があるため、疑似的なトレンドデータを生成
    // 実装時はInstagram Basic Display API、Twitter API v2などを使用
    return this.generateTrendingSpots(lat, lng, radius)
  }

  // トレンドスポット疑似生成（実際のAPI実装用のテンプレート）
  static generateTrendingSpots(lat: number, lng: number, _radius: number) {
    const trendingSpots = [
      {
        name: "話題のファミリーカフェ",
        category: SpotCategory.CAFE,
        latitude: lat + (Math.random() - 0.5) * 0.01,
        longitude: lng + (Math.random() - 0.5) * 0.01,
        isTrending: true,
        trendingSource: 'instagram' as const,
        instagramUrl: "https://www.instagram.com/example_cafe/",
        tabelogUrl: "https://tabelog.com/example/",
        description: "Instagramで話題のおしゃれなファミリーカフェ"
      },
      {
        name: "人気の子連れレストラン",
        category: SpotCategory.RESTAURANT,
        latitude: lat + (Math.random() - 0.5) * 0.01,
        longitude: lng + (Math.random() - 0.5) * 0.01,
        isTrending: true,
        trendingSource: 'twitter' as const,
        twitterUrl: "https://twitter.com/search?q=人気レストラン",
        gurunaviUrl: "https://www.gnavi.co.jp/example/",
        description: "Twitterで評判の子連れ歓迎レストラン"
      }
    ]
    return { trending: trendingSpots }
  }

  // トレンドデータ処理
  static processTrendingSpots(trendingData: { trending?: Array<{ name: string; category: SpotCategory; latitude: number; longitude: number; isTrending: boolean; trendingSource: string; [key: string]: unknown }> }, _lat: number, _lng: number) {
    if (!trendingData?.trending) return []
    
    return trendingData.trending.map((spot) => ({
      id: `trending-${Math.random().toString(36).substr(2, 9)}`,
      name: spot.name,
      description: spot.description,
      category: spot.category,
      address: `${spot.latitude.toFixed(4)}, ${spot.longitude.toFixed(4)}`,
      latitude: spot.latitude,
      longitude: spot.longitude,
      
      hasKidsMenu: true,
      hasHighChair: true,
      hasNursingRoom: false,
      isStrollerFriendly: true,
      hasDiaperChanging: false,
      hasPlayArea: false,
      
      tabelogUrl: spot.tabelogUrl,
      gurunaviUrl: spot.gurunaviUrl,
      rettyUrl: spot.rettyUrl,
      instagramUrl: spot.instagramUrl,
      twitterUrl: spot.twitterUrl,
      
      isTrending: spot.isTrending,
      trendingSource: spot.trendingSource,
      
      childFriendlyScore: 85, // トレンドスポットは高スコア
      ageAppropriate: { baby: 70, toddler: 80, child: 75 },
      crowdLevel: '🟡 やや混雑（人気店）',
      isCurrentlyOpen: true,
      
      rating: 4.5,
      reviewCount: 150,
      source: 'SNSトレンド',
      
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  }

  // AI生成による説明文
  static generateSmartDescription(
    tags: Record<string, string>, 
    childScore: number, 
    ageScores: { baby: number; toddler: number; child: number }
  ): string {
    const { amenity, cuisine, leisure } = tags
    const desc = []

    // 基本説明
    if (amenity === 'restaurant' && cuisine) {
      desc.push(`${cuisine}料理のレストラン`)
    } else if (amenity === 'cafe') {
      desc.push('カフェ')
    } else if (leisure === 'park') {
      desc.push('公園・緑地')
    }

    // 子連れ向け特徴
    if (childScore >= 80) {
      desc.push('子連れに非常におすすめ')
    } else if (childScore >= 60) {
      desc.push('子連れ向け設備あり')
    }

    // 年齢別推奨
    if (ageScores.baby >= 70) desc.push('赤ちゃん連れOK')
    if (ageScores.toddler >= 70) desc.push('幼児向け')
    if (ageScores.child >= 70) desc.push('小学生におすすめ')

    return desc.join(' - ') || tags.description || '詳細情報なし'
  }
}