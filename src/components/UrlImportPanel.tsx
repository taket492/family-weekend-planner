'use client'

import { useState } from 'react'

interface ImportResult {
  name?: string
  address?: string
  phoneNumber?: string
  website?: string
  openingHours?: string
  error?: string
}

export default function UrlImportPanel() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)

  const importUrl = async () => {
    setLoading(true)
    setResult(null)
    try {
      const resp = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'import failed')
      setResult(data)
    } catch (e: any) {
      setResult({ error: e?.message || 'インポートに失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-base font-semibold text-gray-900 mb-2">🔗 URLインポート（食べログ/ぐるなび）</h3>
      <div className="flex gap-2 mb-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="店舗のURLを貼り付け"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button onClick={importUrl} disabled={loading || !url} className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50">
          {loading ? '取得中...' : '取り込み'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-2">対応ドメイン: tabelog.com, gnavi.co.jp</p>
      {result && (
        <div className="mt-2 border rounded p-3 bg-gray-50">
          {result.error ? (
            <p className="text-sm text-red-600">{result.error}</p>
          ) : (
            <div className="text-sm text-gray-800 space-y-1">
              <div><span className="text-gray-500">店名:</span> {result.name || '-'}</div>
              <div><span className="text-gray-500">住所:</span> {result.address || '-'}</div>
              <div><span className="text-gray-500">電話:</span> {result.phoneNumber || '-'}</div>
              <div><span className="text-gray-500">営業時間:</span> {result.openingHours || '-'}</div>
              <div><span className="text-gray-500">URL:</span> {result.website || '-'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

