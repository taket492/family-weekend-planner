import { NextResponse } from 'next/server'
import { DataCollectionScheduler } from '@/lib/data-collection/scheduler'
import { DataQualityChecker } from '@/lib/data-collection/quality-checker'

export async function GET() {
  try {
    const scheduler = DataCollectionScheduler.getInstance()
    const schedulerStatus = scheduler.getStatus()
    const qualityReport = await DataQualityChecker.generateQualityReport()

    return NextResponse.json({
      scheduler: {
        isRunning: schedulerStatus.isRunning,
        nextExecution: schedulerStatus.nextExecution
      },
      dataQuality: qualityReport,
      apiStatus: {
        instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
        twitter: !!process.env.TWITTER_BEARER_TOKEN,
        googlePlaces: !!process.env.GOOGLE_PLACES_API_KEY
      },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}
export const runtime = 'nodejs'
