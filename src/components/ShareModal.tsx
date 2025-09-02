'use client'

import { useState } from 'react'
import { Spot, Restaurant } from '@/types'

interface ShareModalProps {
  spot?: Spot
  restaurant?: Restaurant
  onClose: () => void
}

export default function ShareModal({ spot, restaurant, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const item = spot || restaurant
  if (!item) return null

  const shareText = `📍 ${item.name}

${item.description || ''}

住所: ${item.address}
${item.rating ? `評価: ⭐ ${item.rating.toFixed(1)} (${item.reviewCount}件)` : ''}
${item.phoneNumber ? `電話: ${item.phoneNumber}` : ''}

Google Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}

#ファミリーおでかけ #静岡 #子連れ`

  const shareUrl = `${window.location.origin}${spot ? '/' : '/restaurants'}?region=${encodeURIComponent(item.region || 'static')}&highlight=${item.id}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n詳細: ${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareToLine = () => {
    const lineText = encodeURIComponent(`${shareText}\n\n詳細: ${shareUrl}`)
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${lineText}`, '_blank')
  }

  const shareToTwitter = () => {
    const tweetText = encodeURIComponent(`${item.name}に行ってきました！\n\n${item.address}\n${item.rating ? `⭐ ${item.rating.toFixed(1)}` : ''}\n\n#ファミリーおでかけ #静岡 #子連れ`)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: shareText,
          url: shareUrl
        })
      } catch (err) {
        console.error('Native share failed:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📤 スポットを共有
        </h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">{item.name}</h4>
          <p className="text-sm text-gray-600">{item.address}</p>
        </div>

        <div className="space-y-3">
          {/* LINE共有 */}
          <button
            onClick={shareToLine}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 font-medium flex items-center justify-center gap-2"
          >
            💬 LINEで共有
          </button>

          {/* ネイティブ共有（モバイル対応） */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={shareNative}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 font-medium flex items-center justify-center gap-2"
            >
              📱 アプリで共有
            </button>
          )}

          {/* SNS共有 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={shareToTwitter}
              className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 font-medium flex items-center justify-center gap-1"
            >
              🐦 Twitter
            </button>
            
            <button
              onClick={shareToFacebook}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium flex items-center justify-center gap-1"
            >
              📘 Facebook
            </button>
          </div>

          {/* URL・テキストコピー */}
          <button
            onClick={copyToClipboard}
            className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors ${
              copied 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {copied ? '✅ コピーしました!' : '📋 テキストをコピー'}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}