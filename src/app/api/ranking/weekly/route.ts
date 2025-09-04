import { NextRequest, NextResponse } from 'next/server'
import { RankingSystem } from '@/lib/ranking-system'
import { AdvancedSpotSearch } from '@/lib/advanced-search'
import { SpotCategory } from '@/types'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || '静岡県'
    const category = searchParams.get('category')
    const weightsParam = searchParams.get('weights') // CSV like baby,toddler,child (0..1)
    let weights: { baby: number; toddler: number; child: number } | null = null
    if (weightsParam) {
      const [b, t, c] = weightsParam.split(',').map(parseFloat)
      if ([b, t, c].every((n) => !Number.isNaN(n))) {
        const sum = (b + t + c) || 1
        weights = { baby: b / sum, toddler: t / sum, child: c / sum }
      }
    }
    
    let spots = await AdvancedSpotSearch.comprehensiveSearch(
      region.includes('県') ? region.replace('県', '') : region,
      '静岡県',
      { 
        categories: category ? [category as SpotCategory] : undefined,
        minChildScore: 50 
      }
    )

    spots = spots.filter(spot => RankingSystem.isShizuokaSpot(spot.address))

    // Profile-aware weighting
    if (weights) {
      spots = spots.map((s: any) => {
        const ap = s.ageAppropriate || { baby: 0, toddler: 0, child: 0 }
        const wScore = ap.baby * weights!.baby + ap.toddler * weights!.toddler + ap.child * weights!.child
        return { ...s, _weightedScore: wScore }
      })

      spots.sort((a: any, b: any) => {
        const aScore = (a._weightedScore || 0) * 0.7 + (a.popularityScore || 0) * 0.3
        const bScore = (b._weightedScore || 0) * 0.7 + (b.popularityScore || 0) * 0.3
        return bScore - aScore
      })
    } else {
      spots = spots.filter(s => s.popularityScore && s.popularityScore > 60)
      spots.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
    }

    const rankedSpots = RankingSystem.calculateWeeklyRank(spots)

    const currentMonth = new Date().getMonth() + 1
    const seasonalRecommendations = RankingSystem.getSeasonalRecommendations(currentMonth, region)
    
    const spotsWithSeasonal = RankingSystem.filterBySeasonalRecommendation(
      rankedSpots, 
      seasonalRecommendations
    )

    return NextResponse.json({
      weeklyRanking: spotsWithSeasonal.slice(0, 20),
      seasonalRecommendations,
      region,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating weekly ranking:', error)
    return NextResponse.json(
      { error: 'Failed to generate weekly ranking' },
      { status: 500 }
    )
  }
}
