import { Spot, SpotCategory } from '@/types'
import { prisma } from '@/lib/prisma'

interface QualityCheckResult {
  isValid: boolean
  score: number
  issues: string[]
  suggestions: string[]
}

export class DataQualityChecker {
  
  // データ品質チェックメイン関数
  static async checkSpotQuality(spot: Partial<Spot>): Promise<QualityCheckResult> {
    const result: QualityCheckResult = {
      isValid: true,
      score: 100,
      issues: [],
      suggestions: []
    }

    // 必須フィールドチェック
    if (!spot.name?.trim()) {
      result.issues.push('スポット名が空です')
      result.score -= 30
      result.isValid = false
    }

    if (!spot.latitude || !spot.longitude) {
      result.issues.push('位置情報が不正です')
      result.score -= 25
      result.isValid = false
    }

    // 座標の妥当性チェック（静岡県の範囲）
    if (spot.latitude && spot.longitude) {
      const isInShizuoka = this.isInShizuokaPrefecture(spot.latitude, spot.longitude)
      if (!isInShizuoka) {
        result.issues.push('静岡県外の座標です')
        result.score -= 20
      }
    }

    // 名前の品質チェック
    if (spot.name) {
      const nameQuality = this.checkNameQuality(spot.name)
      result.score += nameQuality.score - 50 // 正規化
      result.issues.push(...nameQuality.issues)
      result.suggestions.push(...nameQuality.suggestions)
    }

    // 説明文の品質チェック
    if (spot.description) {
      const descQuality = this.checkDescriptionQuality(spot.description)
      result.score += descQuality.score - 50
      result.suggestions.push(...descQuality.suggestions)
    }

    // 重複チェック
    const duplicateCheck = await this.checkDuplicate(spot)
    if (duplicateCheck.isDuplicate) {
      result.issues.push(`重複の可能性: ${duplicateCheck.similarSpots.map(s => s.name).join(', ')}`)
      result.score -= 15
    }

    // SNSソースの信頼性チェック
    if (spot.trendingSource) {
      const sourceQuality = this.checkSourceReliability(spot)
      result.score += sourceQuality.score - 50
      result.suggestions.push(...sourceQuality.suggestions)
    }

    // 最終スコア調整
    result.score = Math.max(0, Math.min(100, Math.round(result.score)))
    result.isValid = result.score >= 60 && result.issues.length === 0

    return result
  }

  // 静岡県内座標チェック
  private static isInShizuokaPrefecture(lat: number, lng: number): boolean {
    // 静岡県の大まかな範囲
    return lat >= 34.5 && lat <= 35.5 && lng >= 137.5 && lng <= 139.5
  }

  // 名前品質チェック
  private static checkNameQuality(name: string): {
    score: number
    issues: string[]
    suggestions: string[]
  } {
    const result = { score: 50, issues: [] as string[], suggestions: [] as string[] }

    // 長さチェック
    if (name.length < 2) {
      result.issues.push('名前が短すぎます')
      result.score -= 20
    } else if (name.length > 50) {
      result.issues.push('名前が長すぎます')
      result.score -= 10
    }

    // 不適切文字チェック
    if (/[<>\"'&]/.test(name)) {
      result.issues.push('不適切な文字が含まれています')
      result.score -= 15
    }

    // URL形式の名前チェック
    if (name.includes('http') || name.includes('www.')) {
      result.issues.push('URLが名前に含まれています')
      result.score -= 25
    }

    // 日本語含有チェック
    if (!/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(name)) {
      result.suggestions.push('日本語表記の追加を推奨')
      result.score -= 5
    }

    // 情報の豊富さ
    if (name.includes('カフェ') || name.includes('レストラン') || name.includes('公園')) {
      result.score += 10
    }

    return result
  }

  // 説明文品質チェック
  private static checkDescriptionQuality(description: string): {
    score: number
    suggestions: string[]
  } {
    const result = { score: 50, suggestions: [] as string[] }

    if (!description.trim()) {
      result.score = 0
      result.suggestions.push('説明文の追加が必要です')
      return result
    }

    // 長さチェック
    if (description.length < 10) {
      result.score -= 20
      result.suggestions.push('より詳細な説明が必要です')
    } else if (description.length > 500) {
      result.score -= 10
      result.suggestions.push('説明文が長すぎます')
    }

    // 子連れ関連キーワードの有無
    const familyKeywords = ['子連れ', 'ファミリー', 'キッズ', '子供', '親子']
    const hasFamilyKeyword = familyKeywords.some(keyword => description.includes(keyword))
    if (hasFamilyKeyword) {
      result.score += 15
    } else {
      result.suggestions.push('子連れ向け情報の追加を推奨')
    }

    // 具体的情報の有無
    const specificInfo = ['営業時間', '料金', '駐車場', '予約', '設備']
    const infoCount = specificInfo.filter(info => description.includes(info)).length
    result.score += infoCount * 5

    return result
  }

  // 重複チェック
  private static async checkDuplicate(spot: Partial<Spot>): Promise<{
    isDuplicate: boolean
    similarSpots: { id: string; name: string; similarity: number }[]
  }> {
    if (!spot.name || !spot.latitude || !spot.longitude) {
      return { isDuplicate: false, similarSpots: [] }
    }

    try {
      // 名前による完全一致チェック
      const exactNameMatch = await prisma.spot.findFirst({
        where: { name: spot.name }
      })

      if (exactNameMatch) {
        return {
          isDuplicate: true,
          similarSpots: [{
            id: exactNameMatch.id,
            name: exactNameMatch.name,
            similarity: 100
          }]
        }
      }

      // 位置による近似チェック（100m以内）
      const nearbySpots = await prisma.spot.findMany({
        where: {
          latitude: {
            gte: spot.latitude - 0.001,
            lte: spot.latitude + 0.001
          },
          longitude: {
            gte: spot.longitude - 0.001,
            lte: spot.longitude + 0.001
          }
        },
        take: 5
      })

      const similarSpots = nearbySpots.map(existing => ({
        id: existing.id,
        name: existing.name,
        similarity: this.calculateNameSimilarity(spot.name!, existing.name)
      })).filter(s => s.similarity > 0.7)

      return {
        isDuplicate: similarSpots.length > 0,
        similarSpots
      }

    } catch (error) {
      console.error('Duplicate check error:', error)
      return { isDuplicate: false, similarSpots: [] }
    }
  }

  // 名前類似度計算（簡易版）
  private static calculateNameSimilarity(name1: string, name2: string): number {
    const clean1 = name1.toLowerCase().replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
    const clean2 = name2.toLowerCase().replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
    
    if (clean1 === clean2) return 1.0
    if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.8
    
    // レーベンシュタイン距離による類似度
    const distance = this.levenshteinDistance(clean1, clean2)
    const maxLength = Math.max(clean1.length, clean2.length)
    return 1 - (distance / maxLength)
  }

  // レーベンシュタイン距離計算
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  // SNSソース信頼性チェック
  private static checkSourceReliability(spot: Partial<Spot>): {
    score: number
    suggestions: string[]
  } {
    const result = { score: 50, suggestions: [] as string[] }

    if (spot.trendingSource === 'instagram') {
      result.score += 10
      if (spot.instagramUrl) result.score += 5
    }

    if (spot.trendingSource === 'twitter') {
      result.score += 5
      if (spot.twitterUrl) result.score += 5
    }

    if (spot.popularityScore && spot.popularityScore > 70) {
      result.score += 10
    }

    if (!spot.trendingSource) {
      result.suggestions.push('SNSソース情報の追加を推奨')
      result.score -= 10
    }

    return result
  }

  // 承認待ちスポット一覧取得
  static async getPendingApproval(): Promise<Array<{
    spot: Partial<Spot>
    qualityCheck: QualityCheckResult
    collectedAt: Date
  }>> {
    // 実装時は専用テーブルまたはステータスフィールドを使用
    return []
  }

  // スポット承認
  static async approveSpot(spotId: string, adminUserId: string): Promise<boolean> {
    try {
      // 承認ログの記録
      console.log(`✅ スポット承認: ${spotId} by ${adminUserId}`)
      
      // 実装時は承認ステータスの更新とログ記録
      return true
    } catch (error) {
      console.error('Approval error:', error)
      return false
    }
  }

  // スポット却下
  static async rejectSpot(spotId: string, reason: string, adminUserId: string): Promise<boolean> {
    try {
      // 却下ログの記録
      console.log(`❌ スポット却下: ${spotId} - ${reason} by ${adminUserId}`)
      
      // 実装時は却下理由の記録と通知
      return true
    } catch (error) {
      console.error('Rejection error:', error)
      return false
    }
  }

  // データ品質レポート生成
  static async generateQualityReport(): Promise<{
    totalSpots: number
    highQuality: number
    mediumQuality: number
    lowQuality: number
    needsApproval: number
    duplicates: number
    lastUpdated: Date
  }> {
    try {
      const totalSpots = await prisma.spot.count()
      
      // 実装時は品質スコアによる分類集計
      return {
        totalSpots,
        highQuality: Math.floor(totalSpots * 0.7),
        mediumQuality: Math.floor(totalSpots * 0.2),
        lowQuality: Math.floor(totalSpots * 0.1),
        needsApproval: 0,
        duplicates: 0,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Quality report generation error:', error)
      return {
        totalSpots: 0,
        highQuality: 0,
        mediumQuality: 0,
        lowQuality: 0,
        needsApproval: 0,
        duplicates: 0,
        lastUpdated: new Date()
      }
    }
  }
}