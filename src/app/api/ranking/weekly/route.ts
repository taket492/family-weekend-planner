import { NextRequest, NextResponse } from 'next/server'
import { RankingSystem } from '@/lib/ranking-system'
import { AdvancedSpotSearch } from '@/lib/advanced-search'
import { SpotCategory } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || '静岡県'
    const category = searchParams.get('category')
    
    let spots = await AdvancedSpotSearch.comprehensiveSearch(
      region.includes('県') ? region.replace('県', '') : region,
      '静岡県',
      { 
        categories: category ? [category as SpotCategory] : undefined,
        minChildScore: 50 
      }
    )

    spots = spots.filter(spot => 
      RankingSystem.isShizuokaSpot(spot.address) &&
      spot.popularityScore && spot.popularityScore > 60
    )

    const rankedSpots = RankingSystem.calculateWeeklyRank(
      spots.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
    )

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