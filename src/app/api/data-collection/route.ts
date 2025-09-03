import { NextRequest, NextResponse } from 'next/server'
import { DataCollectionManager } from '@/lib/data-collection/db-manager'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック（本番環境では必須）
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.DATA_COLLECTION_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🚀 データ収集プロセスを開始します...')
    
    const results = await DataCollectionManager.collectAndRegisterData()
    
    return NextResponse.json({
      success: true,
      summary: {
        spotsAdded: results.spotsAdded,
        spotsUpdated: results.spotsUpdated,
        totalProcessed: results.spotsAdded + results.spotsUpdated,
        errors: results.errors
      },
      executedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Data collection failed:', error)
    return NextResponse.json(
      { 
        error: 'Data collection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 手動実行用GETエンドポイント（開発環境のみ）
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Manual execution not allowed in production' },
      { status: 403 }
    )
  }

  try {
    const results = await DataCollectionManager.collectAndRegisterData()
    
    return NextResponse.json({
      success: true,
      summary: results,
      message: 'データ収集が完了しました'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Collection failed', details: error },
      { status: 500 }
    )
  }
}
export const runtime = 'nodejs'
