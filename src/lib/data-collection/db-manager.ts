import { prisma } from '@/lib/prisma'
import { Spot, Restaurant, SpotCategory, PriceRange } from '@/types'
import { SNSDataCollector } from './sns-collector'
import { DataQualityChecker } from './quality-checker'

export class DataCollectionManager {
  
  // メイン収集・登録フロー
  static async collectAndRegisterData(): Promise<{
    spotsAdded: number
    spotsUpdated: number
    errors: string[]
  }> {
    const results = {
      spotsAdded: 0,
      spotsUpdated: 0,
      errors: [] as string[]
    }

    try {
      console.log('🔍 SNSデータ収集を開始...')
      
      // Instagram & Twitter からデータ収集
      const [instagramSpots, twitterSpots] = await Promise.all([
        SNSDataCollector.collectFromInstagram().catch(err => {
          results.errors.push(`Instagram収集エラー: ${err.message}`)
          return []
        }),
        SNSDataCollector.collectFromTwitter().catch(err => {
          results.errors.push(`Twitter収集エラー: ${err.message}`)
          return []
        })
      ])

      // データ統合・重複排除
      const allSpots = [...instagramSpots, ...twitterSpots]
      const deduplicatedSpots = this.deduplicateSpots(allSpots)
      
      console.log(`📊 ${deduplicatedSpots.length}件のユニークスポットを発見`)

      // Google Places APIで情報補完
      const enrichedSpots = await SNSDataCollector.enrichWithGooglePlaces(deduplicatedSpots)
      
      console.log(`✨ ${enrichedSpots.length}件のスポット情報を補完`)

      // DB登録・更新（品質チェック付き）
      for (const spot of enrichedSpots) {
        try {
          // データ品質チェック
          const qualityCheck = await DataQualityChecker.checkSpotQuality(spot)
          
          if (!qualityCheck.isValid) {
            results.errors.push(`品質チェック失敗 (${spot.name}): ${qualityCheck.issues.join(', ')}`)
            continue
          }

          if (qualityCheck.score < 70) {
            console.warn(`⚠️ 低品質データ (スコア: ${qualityCheck.score}): ${spot.name}`)
          }

          const existing = await prisma.spot.findFirst({
            where: {
              OR: [
                { name: spot.name },
                {
                  AND: [
                    { latitude: { gte: spot.latitude - 0.001, lte: spot.latitude + 0.001 } },
                    { longitude: { gte: spot.longitude - 0.001, lte: spot.longitude + 0.001 } }
                  ]
                }
              ]
            }
          })

          if (existing) {
            // 既存スポットの更新（品質スコアが向上した場合のみ）
            const existingQuality = await DataQualityChecker.checkSpotQuality({
              name: existing.name,
              description: existing.description || undefined,
              latitude: existing.latitude,
              longitude: existing.longitude
            })

            if (qualityCheck.score > existingQuality.score) {
              await prisma.spot.update({
                where: { id: existing.id },
                data: {
                  description: spot.description || existing.description,
                  rating: spot.rating || existing.rating,
                  reviewCount: Math.max(spot.reviewCount, existing.reviewCount),
                  popularityScore: Math.max(spot.popularityScore || 0, existing.popularityScore || 0),
                  isTrending: true,
                  trendingSource: spot.trendingSource,
                  instagramUrl: spot.instagramUrl || existing.instagramUrl,
                  twitterUrl: spot.twitterUrl || existing.twitterUrl,
                  seasonalEventType: spot.seasonalEventType || existing.seasonalEventType,
                  updatedAt: new Date()
                }
              })
              results.spotsUpdated++
              console.log(`✨ 品質向上更新: ${spot.name} (${existingQuality.score} → ${qualityCheck.score})`)
            }
          } else {
            // 新規スポット登録
            await prisma.spot.create({
              data: {
                name: spot.name,
                description: spot.description,
                category: spot.category,
                address: spot.address,
                latitude: spot.latitude,
                longitude: spot.longitude,
                
                hasKidsMenu: spot.hasKidsMenu || false,
                hasHighChair: spot.hasHighChair || false,
                hasNursingRoom: spot.hasNursingRoom || false,
                isStrollerFriendly: spot.isStrollerFriendly || false,
                hasDiaperChanging: spot.hasDiaperChanging || false,
                hasPlayArea: spot.hasPlayArea || false,
                
                phoneNumber: spot.phoneNumber,
                website: spot.website,
                openingHours: spot.openingHours,
                priceRange: spot.priceRange,
                
                rating: spot.rating,
                reviewCount: spot.reviewCount,
                
                region: this.extractRegion(spot.address || ''),
                isShizuokaSpot: true,
                popularityScore: spot.popularityScore,
                
                // 詳細施設情報（推定）
                isIndoor: this.estimateIndoor(spot.category, spot.name),
                isOutdoor: this.estimateOutdoor(spot.category, spot.name),
                hasParking: this.estimateParking(spot.category),
                isFree: this.estimateFree(spot.category, spot.name),
                seasonalEventType: spot.seasonalEventType,
                
                isTrending: spot.isTrending,
                trendingSource: spot.trendingSource,
                instagramUrl: spot.instagramUrl,
                twitterUrl: spot.twitterUrl
              }
            })
            results.spotsAdded++
            console.log(`🆕 新規登録: ${spot.name} (品質スコア: ${qualityCheck.score})`)
          }
        } catch (error) {
          results.errors.push(`DB登録エラー (${spot.name}): ${error}`)
        }
      }

    } catch (error) {
      results.errors.push(`メイン処理エラー: ${error}`)
    }

    return results
  }

  // 重複排除
  private static deduplicateSpots(spots: Partial<Spot>[]): Partial<Spot>[] {
    const seen = new Set<string>()
    const unique: Partial<Spot>[] = []
    
    for (const spot of spots) {
      if (!spot.name) continue
      
      const key = this.normalizeSpotName(spot.name)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(spot)
      }
    }
    
    return unique
  }

  private static normalizeSpotName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[、。！？\s]/g, '')
      .replace(/店$|カフェ$|レストラン$/g, '')
  }

  // 地域抽出
  private static extractRegion(address: string): string {
    const regions = ['静岡市', '浜松市', '沼津市', '熱海市', '富士市', '伊豆市']
    return regions.find(region => address.includes(region)) || '静岡県'
  }

  // 屋内/屋外推定
  private static estimateIndoor(category: SpotCategory, name: string): boolean {
    if (category === SpotCategory.MUSEUM) return true
    if (category === SpotCategory.SHOPPING) return true
    if (name.includes('屋内') || name.includes('インドア')) return true
    return false
  }

  private static estimateOutdoor(category: SpotCategory, name: string): boolean {
    if (category === SpotCategory.PARK) return true
    if (name.includes('屋外') || name.includes('アウトドア')) return true
    return false
  }

  // 駐車場推定
  private static estimateParking(category: SpotCategory): boolean {
    return ![SpotCategory.CAFE, SpotCategory.RESTAURANT].includes(category)
  }

  // 無料推定  
  private static estimateFree(category: SpotCategory, name: string): boolean {
    if (category === SpotCategory.PARK) return true
    if (name.includes('無料') || name.includes('フリー')) return true
    return false
  }
}