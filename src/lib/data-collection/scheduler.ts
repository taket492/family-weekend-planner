import { DataCollectionManager } from './db-manager'

export class DataCollectionScheduler {
  private static instance: DataCollectionScheduler
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  static getInstance(): DataCollectionScheduler {
    if (!this.instance) {
      this.instance = new DataCollectionScheduler()
    }
    return this.instance
  }

  // 定期実行開始（本番環境用）
  start(intervalHours: number = 6): void {
    if (this.isRunning) {
      console.log('⚠️ データ収集スケジューラーは既に実行中です')
      return
    }

    console.log(`🕐 データ収集を${intervalHours}時間間隔で開始します`)
    
    this.intervalId = setInterval(async () => {
      try {
        console.log('📅 定期データ収集を実行中...')
        await this.executeCollection()
      } catch (error) {
        console.error('定期収集エラー:', error)
      }
    }, intervalHours * 60 * 60 * 1000)

    this.isRunning = true

    // 初回即座実行
    this.executeCollection()
  }

  // 定期実行停止
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.isRunning = false
      console.log('⏹️ データ収集スケジューラーを停止しました')
    }
  }

  // 手動実行
  async executeCollection(): Promise<void> {
    try {
      console.log('🚀 SNSデータ収集を開始...')
      
      const startTime = Date.now()
      const results = await DataCollectionManager.collectAndRegisterData()
      const duration = Date.now() - startTime

      console.log('✅ データ収集完了', {
        実行時間: `${Math.round(duration / 1000)}秒`,
        新規追加: `${results.spotsAdded}件`,
        更新: `${results.spotsUpdated}件`,
        エラー: `${results.errors.length}件`
      })

      // エラーがある場合は詳細ログ
      if (results.errors.length > 0) {
        console.warn('⚠️ 収集中のエラー:', results.errors)
      }

      // Webhookやメール通知（必要に応じて）
      await this.notifyCompletion(results)

    } catch (error) {
      console.error('💥 データ収集に失敗しました:', error)
      await this.notifyError(error)
    }
  }

  // 実行状況取得
  getStatus(): {
    isRunning: boolean
    nextExecution: Date | null
  } {
    return {
      isRunning: this.isRunning,
      nextExecution: this.intervalId ? new Date() : null
    }
  }

  // 完了通知（Slack, Discord, メールなど）
  private async notifyCompletion(results: {
    spotsAdded: number
    spotsUpdated: number
    errors: string[]
  }): Promise<void> {
    const message = `📊 データ収集完了
新規: ${results.spotsAdded}件
更新: ${results.spotsUpdated}件
エラー: ${results.errors.length}件
実行時刻: ${new Date().toLocaleString('ja-JP')}`

    // 本番環境ではSlack Webhook等を実装
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        })
      } catch (error) {
        console.error('Slack通知エラー:', error)
      }
    }
  }

  // エラー通知
  private async notifyError(error: unknown): Promise<void> {
    const message = `🚨 データ収集エラー
エラー: ${error instanceof Error ? error.message : 'Unknown error'}
実行時刻: ${new Date().toLocaleString('ja-JP')}`

    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        })
      } catch (notifyError) {
        console.error('エラー通知に失敗:', notifyError)
      }
    }
  }
}

// Next.js環境での自動開始
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  const scheduler = DataCollectionScheduler.getInstance()
  
  // 本番環境では6時間間隔で実行
  scheduler.start(6)
  
  // Graceful shutdown
  process.on('SIGINT', () => scheduler.stop())
  process.on('SIGTERM', () => scheduler.stop())
}