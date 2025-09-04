'use client'

import { useState } from 'react'
import { useSpotStore } from '@/lib/stores/useSpotStore'
import { Spot, SpotCategory, PriceRange } from '@/types'

type TemplateType = 'halfday' | 'fullday' | 'rainy'

export default function TemplateGenerator() {
  const { spots, setSelectedSpots } = useSpotStore()
  const [template, setTemplate] = useState<TemplateType>('halfday')
  const [budget, setBudget] = useState<PriceRange | ''>('')

  const generate = () => {
    let pool = spots
    if (template === 'rainy') {
      // Prefer indoor categories
      pool = pool.filter(s => s.category !== SpotCategory.PARK && s.category !== SpotCategory.PLAYGROUND)
    }
    if (budget) {
      pool = pool.filter(s => s.priceRange === budget)
    }
    const count = template === 'fullday' ? 5 : 3
    const selected: Spot[] = pool.slice(0, count)
    if (selected.length === 0) return alert('条件に合うスポットがありません。検索条件を調整してください。')
    setSelectedSpots(selected)
    alert('提案プランをプラン作成に反映しました。順序の最適化や編集を行ってください。')
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">🧩 プランテンプレート / 自動生成</h3>
      <div className="flex items-center gap-2 mb-3">
        <button className={`px-3 py-1 rounded text-sm ${template==='halfday'?'bg-blue-600 text-white':'border'}`} onClick={() => setTemplate('halfday')}>半日</button>
        <button className={`px-3 py-1 rounded text-sm ${template==='fullday'?'bg-blue-600 text-white':'border'}`} onClick={() => setTemplate('fullday')}>1日</button>
        <button className={`px-3 py-1 rounded text-sm ${template==='rainy'?'bg-blue-600 text-white':'border'}`} onClick={() => setTemplate('rainy')}>雨天</button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm text-gray-700">予算</label>
        <select value={budget} onChange={(e) => setBudget(e.target.value as PriceRange | '')} className="border rounded px-2 py-1 text-sm">
          <option value="">指定なし</option>
          <option value={PriceRange.BUDGET}>〜1,000円</option>
          <option value={PriceRange.MODERATE}>1,000〜3,000円</option>
          <option value={PriceRange.EXPENSIVE}>3,000円〜</option>
        </select>
      </div>
      <button onClick={generate} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">提案を生成</button>
      <p className="text-xs text-gray-500 mt-2">検索結果からテンプレに合わせて自動選定します。</p>
    </div>
  )
}

