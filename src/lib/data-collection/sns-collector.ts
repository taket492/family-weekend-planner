import { Spot, SpotCategory, Restaurant, SeasonalEventType, PriceRange } from '@/types'
import { prisma } from '@/lib/prisma'

export class SNSDataCollector {
  private static readonly SHIZUOKA_HASHTAGS = [
    '静岡おでかけ', '静岡カフェ', '静岡グルメ', '静岡観光',
    '浜松', '沼津', '富士山', '熱海', '伊豆',
    '静岡子連れ', '静岡ファミリー', '静岡公園'
  ]

  private static readonly FAMILY_KEYWORDS = [
    '子連れ', 'ファミリー', 'キッズ', '赤ちゃん', 'ベビー',
    '子供', '家族', '親子', 'ベビーカー', '授乳室'
  ]

  // Instagram Graph API連携（エラーハンドリング強化）
  static async collectFromInstagram(): Promise<Partial<Spot>[]> {
    const spots: Partial<Spot>[] = []
    
    if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.INSTAGRAM_USER_ID) {
      console.warn('⚠️ Instagram API credentials not configured')
      return spots
    }
    
    for (const hashtag of this.SHIZUOKA_HASHTAGS) {
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          // レート制限対策
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
          }
          
          // Instagram Graph API呼び出し（要アクセストークン）
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)
          
          const response = await fetch(
            `https://graph.instagram.com/ig_hashtag_search?user_id=${process.env.INSTAGRAM_USER_ID}&q=${encodeURIComponent(hashtag)}&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`,
            { signal: controller.signal }
          )
          
          clearTimeout(timeoutId)
          
          if (response.status === 429) {
            // レート制限エラー
            console.warn(`Instagram rate limit hit for ${hashtag}, retrying...`)
            retryCount++
            continue
          }
          
          if (!response.ok) {
            console.warn(`Instagram API error for ${hashtag}: ${response.status}`)
            break
          }

          const data = await response.json()
          
          if (data.error) {
            console.error(`Instagram API error: ${data.error.message}`)
            break
          }
          
          if (data.data?.length > 0) {
            const hashtagId = data.data[0].id
            
            // ハッシュタグの最新投稿を取得
            const postsController = new AbortController()
            const postsTimeoutId = setTimeout(() => postsController.abort(), 10000)
            
            const postsResponse = await fetch(
              `https://graph.instagram.com/${hashtagId}/recent_media?user_id=${process.env.INSTAGRAM_USER_ID}&fields=id,caption,permalink,timestamp,media_type&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}&limit=50`,
              { signal: postsController.signal }
            )
            
            clearTimeout(postsTimeoutId)
            
            if (postsResponse.ok) {
              const postsData = await postsResponse.json()
              
              for (const post of postsData.data?.slice(0, 20) || []) {
                try {
                  const spotData = await this.extractSpotFromInstagramPost(post)
                  if (spotData) spots.push(spotData)
                } catch (extractError) {
                  console.error(`Post extraction error:`, extractError)
                }
              }
            }
          }
          
          break // 成功時はリトライループを抜ける
          
        } catch (error) {
          console.error(`Instagram collection error for ${hashtag} (attempt ${retryCount + 1}):`, error)
          retryCount++
          
          if (retryCount >= maxRetries) {
            console.error(`Max retries reached for Instagram hashtag: ${hashtag}`)
          }
        }
      }
    }
    
    return spots
  }

  // Twitter API v2連携（エラーハンドリング強化）
  static async collectFromTwitter(): Promise<Partial<Spot>[]> {
    const spots: Partial<Spot>[] = []
    
    if (!process.env.TWITTER_BEARER_TOKEN) {
      console.warn('⚠️ Twitter API credentials not configured')
      return spots
    }
    
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        // レート制限対策
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 3000 * retryCount))
        }
        
        const query = this.SHIZUOKA_HASHTAGS
          .map(tag => `#${tag}`)
          .join(' OR ') + ' has:geo'
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)
        
        const response = await fetch(
          `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&tweet.fields=created_at,geo,public_metrics&expansions=geo.place_id&max_results=100`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
              'User-Agent': 'FamilyWeekendPlannerBot/1.0'
            },
            signal: controller.signal
          }
        )
        
        clearTimeout(timeoutId)
        
        if (response.status === 429) {
          // レート制限エラー
          console.warn('Twitter rate limit hit, retrying...')
          retryCount++
          continue
        }
        
        if (response.status === 401) {
          console.error('Twitter API authentication failed')
          break
        }
        
        if (!response.ok) {
          console.warn(`Twitter API error: ${response.status}`)
          retryCount++
          continue
        }
        
        const data = await response.json()
        
        if (data.errors) {
          console.error('Twitter API errors:', data.errors)
          break
        }
        
        for (const tweet of data.data || []) {
          try {
            const spotData = await this.extractSpotFromTweet(tweet, data.includes?.places)
            if (spotData) spots.push(spotData)
          } catch (extractError) {
            console.error('Tweet extraction error:', extractError)
          }
        }
        
        break // 成功時はリトライループを抜ける
        
      } catch (error) {
        console.error(`Twitter collection error (attempt ${retryCount + 1}):`, error)
        retryCount++
        
        if (retryCount >= maxRetries) {
          console.error('Max retries reached for Twitter API')
        }
      }
    }
    
    return spots
  }

  // Google Places APIで基本情報補完（エラーハンドリング強化）
  static async enrichWithGooglePlaces(spots: Partial<Spot>[]): Promise<Spot[]> {
    const enrichedSpots: Spot[] = []
    
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.warn('⚠️ Google Places API key not configured')
      return enrichedSpots
    }
    
    for (const spot of spots.slice(0, 50)) { // API制限対策で50件まで
      if (!spot.latitude || !spot.longitude) continue
      
      let retryCount = 0
      const maxRetries = 2
      
      while (retryCount < maxRetries) {
        try {
          // レート制限対策
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          }
          
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000)
          
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${spot.latitude},${spot.longitude}&radius=100&key=${process.env.GOOGLE_PLACES_API_KEY}`,
            { signal: controller.signal }
          )
          
          clearTimeout(timeoutId)
          
          if (response.status === 429) {
            console.warn(`Google Places rate limit hit for ${spot.name}, retrying...`)
            retryCount++
            continue
          }
          
          if (!response.ok) {
            console.warn(`Google Places API error for ${spot.name}: ${response.status}`)
            break
          }
          
          const data = await response.json()
          
          if (data.error_message) {
            console.error(`Google Places API error: ${data.error_message}`)
            break
          }
          
          const place = data.results?.[0]
          
          if (place) {
            const enrichedSpot: Spot = {
              id: spot.id || `google_${place.place_id}`,
              name: spot.name || place.name,
              description: spot.description,
              category: this.categorizePlace(place.types),
              address: place.formatted_address || spot.address || '',
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              
              // Google Placesから取得
              rating: place.rating,
              reviewCount: place.user_ratings_total || 0,
              priceRange: this.convertPriceLevel(place.price_level),
              
              // デフォルト値
              hasKidsMenu: false,
              hasHighChair: false,
              hasNursingRoom: false,
              isStrollerFriendly: false,
              hasDiaperChanging: false,
              hasPlayArea: false,
              
              // SNSから推定
              isTrending: true,
              trendingSource: spot.trendingSource as any,
              isShizuokaSpot: true,
              popularityScore: this.calculatePopularityFromSNS(spot)
            }
            
            enrichedSpots.push(enrichedSpot)
          }
          
          break // 成功時はリトライループを抜ける
          
        } catch (error) {
          console.error(`Google Places enrichment error for ${spot.name} (attempt ${retryCount + 1}):`, error)
          retryCount++
          
          if (retryCount >= maxRetries) {
            console.error(`Max retries reached for Google Places: ${spot.name}`)
          }
        }
      }
      
      // API制限対策で少し待機
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return enrichedSpots
  }

  // Instagram投稿からスポット情報抽出
  private static async extractSpotFromInstagramPost(post: any): Promise<Partial<Spot> | null> {
    const caption = post.caption || ''
    
    // 静岡関連 & 子連れ関連キーワードチェック
    const hasShizuokaKeyword = this.SHIZUOKA_HASHTAGS.some(tag => 
      caption.includes(tag) || caption.includes(`#${tag}`)
    )
    
    const hasFamilyKeyword = this.FAMILY_KEYWORDS.some(keyword => 
      caption.includes(keyword)
    )
    
    if (!hasShizuokaKeyword || !hasFamilyKeyword) return null
    
    // 位置情報やスポット名を抽出（簡易実装）
    const locationMatch = caption.match(/(?:＠|@|【|】)([^＠@【】\n]+)/)
    const name = locationMatch?.[1]?.trim()
    
    if (!name) return null
    
    return {
      name,
      description: caption.substring(0, 200),
      trendingSource: 'instagram',
      isTrending: true,
      instagramUrl: post.permalink,
      seasonalEventType: this.detectSeasonalEvent(caption)
    }
  }

  // Twitter投稿からスポット情報抽出  
  private static async extractSpotFromTweet(tweet: any, places?: any[]): Promise<Partial<Spot> | null> {
    const text = tweet.text || ''
    
    const hasFamilyKeyword = this.FAMILY_KEYWORDS.some(keyword => 
      text.includes(keyword)
    )
    
    if (!hasFamilyKeyword) return null
    
    // 位置情報から座標取得
    const place = places?.find(p => p.id === tweet.geo?.place_id)
    
    return {
      description: text,
      latitude: place?.geo?.coordinates?.[1],
      longitude: place?.geo?.coordinates?.[0],
      address: place?.full_name,
      trendingSource: 'twitter',
      isTrending: true,
      twitterUrl: `https://twitter.com/user/status/${tweet.id}`,
      popularityScore: tweet.public_metrics?.like_count || 0
    }
  }

  // カテゴリ推定
  private static categorizePlace(types: string[]): SpotCategory {
    if (types.includes('restaurant') || types.includes('food')) return SpotCategory.RESTAURANT
    if (types.includes('cafe')) return SpotCategory.CAFE
    if (types.includes('park')) return SpotCategory.PARK
    if (types.includes('museum')) return SpotCategory.MUSEUM
    if (types.includes('amusement_park')) return SpotCategory.ENTERTAINMENT
    if (types.includes('tourist_attraction')) return SpotCategory.TOURIST_SPOT
    
    return SpotCategory.TOURIST_SPOT
  }

  // 季節イベント検出
  private static detectSeasonalEvent(text: string): SeasonalEventType | undefined {
    if (text.includes('花火') || text.includes('夏祭り')) return SeasonalEventType.FIREWORKS
    if (text.includes('いちご狩り') || text.includes('苺狩り')) return SeasonalEventType.STRAWBERRY_PICKING
    if (text.includes('プール') || text.includes('海水浴')) return SeasonalEventType.SWIMMING_POOL
    if (text.includes('クリスマス') || text.includes('イルミネーション')) return SeasonalEventType.CHRISTMAS
    if (text.includes('桜') || text.includes('花見')) return SeasonalEventType.CHERRY_BLOSSOM
    if (text.includes('紅葉') || text.includes('もみじ')) return SeasonalEventType.AUTUMN_LEAVES
    
    return undefined
  }

  // SNS人気度計算
  private static calculatePopularityFromSNS(spot: Partial<Spot>): number {
    let score = 50 // ベーススコア
    
    if (spot.trendingSource === 'instagram') score += 20
    if (spot.trendingSource === 'twitter') score += 15
    if (spot.popularityScore) score += Math.min(spot.popularityScore * 0.1, 30)
    
    return Math.min(score, 100)
  }

  // 価格レベル変換
  private static convertPriceLevel(priceLevel?: number): PriceRange | undefined {
    if (!priceLevel) return undefined
    if (priceLevel <= 1) return PriceRange.BUDGET
    if (priceLevel <= 2) return PriceRange.MODERATE
    return PriceRange.EXPENSIVE
  }
}