import { Spot, SeasonalRecommendation } from '@/types'

export class RankingSystem {
  private static readonly SHIZUOKA_REGIONS = [
    '静岡市', '浜松市', '沼津市', '熱海市', '三島市', '富士宮市', '伊東市',
    '島田市', '富士市', '磐田市', '焼津市', '掛川市', '藤枝市', '御殿場市',
    '袋井市', '下田市', '裾野市', '湖西市', '伊豆市', '御前崎市', '菊川市',
    '伊豆の国市', '牧之原市'
  ]

  static calculateWeeklyRank(spots: Spot[]): Spot[] {
    return spots.map((spot, index) => ({
      ...spot,
      weeklyRank: index + 1,
      popularityScore: this.calculatePopularityScore(spot)
    }))
  }

  private static calculatePopularityScore(spot: Spot): number {
    let score = 0
    
    if (spot.rating) score += spot.rating * 20
    score += spot.reviewCount * 0.1
    if (spot.isTrending) score += 30
    
    if (spot.hasKidsMenu) score += 10
    if (spot.hasHighChair) score += 8
    if (spot.hasNursingRoom) score += 15
    if (spot.isStrollerFriendly) score += 12
    if (spot.hasDiaperChanging) score += 15
    if (spot.hasPlayArea) score += 20
    
    return Math.min(score, 100)
  }

  static getSeasonalRecommendations(month: number, region: string): SeasonalRecommendation[] {
    const recommendations: SeasonalRecommendation[] = []
    
    if (month >= 3 && month <= 5) {
      recommendations.push({
        season: 'spring',
        reason: '桜の季節、お花見に最適',
        bestMonths: [4, 5],
        specialFeatures: ['桜スポット', '公園', '屋外カフェ']
      })
    }
    
    if (month >= 6 && month <= 8) {
      recommendations.push({
        season: 'summer',
        reason: '海水浴、避暑地、夏祭り',
        bestMonths: [7, 8],
        specialFeatures: ['海水浴場', '涼しい屋内施設', '夏祭り会場']
      })
    }
    
    if (month >= 9 && month <= 11) {
      recommendations.push({
        season: 'autumn',
        reason: '紅葉狩り、行楽シーズン',
        bestMonths: [10, 11],
        specialFeatures: ['紅葉スポット', 'みかん狩り', 'ハイキングコース']
      })
    }
    
    if (month === 12 || month <= 2) {
      recommendations.push({
        season: 'winter',
        reason: '温泉、イルミネーション',
        bestMonths: [12, 1, 2],
        specialFeatures: ['温泉施設', 'イルミネーション', '屋内遊び場']
      })
    }
    
    return recommendations
  }

  static filterBySeasonalRecommendation(
    spots: Spot[], 
    recommendations: SeasonalRecommendation[]
  ): Spot[] {
    return spots.map(spot => {
      const seasonalRec = recommendations.find(rec => 
        rec.specialFeatures.some(feature => 
          spot.name.includes(feature) || 
          spot.description?.includes(feature) ||
          spot.category.toLowerCase().includes(feature.toLowerCase())
        )
      )
      
      return {
        ...spot,
        seasonalRecommendation: seasonalRec,
        popularityScore: seasonalRec 
          ? (spot.popularityScore || 0) + 20 
          : spot.popularityScore
      }
    })
  }

  static isShizuokaSpot(address: string): boolean {
    return this.SHIZUOKA_REGIONS.some(region => address.includes(region))
  }
}