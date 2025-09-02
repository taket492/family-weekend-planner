// メモリキャッシュシステム（無料版用の高度最適化）
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

class AdvancedCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private maxSize = 1000 // 最大キャッシュ数
  private defaultTTL = 300000 // 5分

  // インテリジェントキーの生成（地域ベース）
  generateKey(region: string, prefecture: string, filters: Record<string, unknown>): string {
    const filterHash = JSON.stringify({
      ...filters,
      region,
      prefecture
    })
    
    return Buffer.from(filterHash).toString('base64').slice(0, 32)
  }

  // 時間帯別TTL（営業時間に応じて動的調整）
  calculateTTL(category: string, hour: number): number {
    // 営業時間中は短く、営業時間外は長く
    if (category === 'RESTAURANT') {
      if (hour >= 11 && hour <= 14) return 120000 // ランチタイム: 2分
      if (hour >= 18 && hour <= 21) return 120000 // ディナータイム: 2分
      return 600000 // その他: 10分
    }
    
    if (category === 'PLAYGROUND' || category === 'PARK') {
      if (hour >= 10 && hour <= 16) return 300000 // 日中: 5分
      return 1800000 // 夜間: 30分
    }
    
    return this.defaultTTL
  }

  // キャッシュサイズ管理（LRU削除）
  private evictIfNeeded() {
    if (this.cache.size <= this.maxSize) return
    
    // 最も古いエントリを削除
    const oldestKey = Array.from(this.cache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0]
    
    this.cache.delete(oldestKey)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }
    
    // アクセス時刻更新（LRU）
    entry.timestamp = Date.now()
    return entry.data
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.defaultTTL
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    }
    
    this.evictIfNeeded()
    this.cache.set(key, entry)
  }

  // バックグラウンド更新（プリフェッチ）
  async backgroundUpdate<T>(
    key: string,
    updateFunction: () => Promise<T>,
    threshold: number = 0.8
  ): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    
    const timeLeft = entry.expiry - Date.now()
    const totalTTL = entry.expiry - entry.timestamp + timeLeft
    
    // キャッシュの80%が経過したらバックグラウンド更新
    if (timeLeft < totalTTL * (1 - threshold)) {
      updateFunction().then(newData => {
        this.set(key, newData)
      }).catch(console.error)
    }
    
    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  // 統計情報
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? 'N/A' : '0%' // 実装簡略化
    }
  }
}

export const spotCache = new AdvancedCache()