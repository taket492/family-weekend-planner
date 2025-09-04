'use client'

import { useState, useEffect } from 'react'
import { useProfileStore, type ChildProfile } from '@/lib/stores/useProfileStore'

export default function ProfilePanel() {
  const { children, setChildren } = useProfileStore()
  const [local, setLocal] = useState<ChildProfile[]>(children.length ? children : [{ type: 'years', value: 3 }])

  useEffect(() => {
    if (children.length) setLocal(children)
  }, [children])

  const update = (idx: number, patch: Partial<ChildProfile>) => {
    setLocal(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c))
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">👨‍👩‍👧 ファミリープロファイル</h3>
      <div className="space-y-3">
        {local.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={c.type}
              onChange={(e) => update(i, { type: e.target.value as ChildProfile['type'] })}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="months">月齢</option>
              <option value="years">歳</option>
            </select>
            <input
              type="number"
              min={0}
              value={c.value}
              onChange={(e) => update(i, { value: Number(e.target.value) })}
              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button
              onClick={() => setLocal(prev => prev.filter((_, idx) => idx !== i))}
              className="text-red-600 text-sm"
              aria-label="削除"
            >
              削除
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={() => setLocal(prev => [...prev, { type: 'years', value: 0 }])}
            className="text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            + 追加
          </button>
          <button
            onClick={() => setChildren(local)}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            保存
          </button>
        </div>
        <p className="text-xs text-gray-500">ローカル保存のみ。サーバには送信しません。</p>
      </div>
    </div>
  )
}

