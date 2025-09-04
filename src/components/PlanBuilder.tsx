'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSpotStore } from '@/lib/stores/useSpotStore'
import { computeSegments, estimateTravelTimeHours, optimizeOrder, TravelMode } from '@/lib/route-optimizer'
import { usePlanStore } from '@/lib/stores/usePlanStore'
import { usePlanCollabStore } from '@/lib/stores/usePlanCollabStore'

interface PlanFormData {
  title: string
  description?: string
  date: string
  region: string
}

export default function PlanBuilder() {
  const { selectedSpots, removeSelectedSpot, clearSelectedSpots, reorderSelectedSpots } = useSpotStore()
  const [mode, setMode] = useState<TravelMode>('drive')
  const [segments, setSegments] = useState<{ distanceKm: number; hours: number }[]>([])
  const { createPlan, isLoading, currentPlan } = usePlanStore()
  const { comments, checklist, addComment, deleteComment, addChecklist, toggleChecklist, deleteChecklist } = usePlanCollabStore()
  const [commentText, setCommentText] = useState('')
  const [checkText, setCheckText] = useState('')
  const [serverComments, setServerComments] = useState<any[]>([])
  const [serverChecklist, setServerChecklist] = useState<any[]>([])
  const [inviteToken, setInviteToken] = useState<string | null>(null)

  // Detect invite token from URL
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search)
      const t = sp.get('invite')
      if (t) setInviteToken(t)
    } catch {}
  }, [])

  // Load collab data from server when possible
  useEffect(() => {
    const load = async () => {
      if (!currentPlan?.id || !inviteToken) return
      try {
        const res = await fetch(`/api/plans/${currentPlan.id}/collab`, { headers: { Authorization: `Bearer ${inviteToken}` }})
        if (res.ok) {
          const data = await res.json()
          setServerComments(data.comments || [])
          setServerChecklist(data.checklist || [])
        }
      } catch {}
    }
    load()
  }, [currentPlan?.id, inviteToken])
  const [showForm, setShowForm] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlanFormData>()

  const onSubmit = async (data: PlanFormData) => {
    if (selectedSpots.length === 0) {
      alert('プランにスポットを追加してください')
      return
    }

    const planData = {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      region: data.region,
      spots: selectedSpots.map((spot, index) => ({
        spotId: spot.id,
        order: index,
        visitTime: null,
        notes: null
      }))
    }

    await createPlan(planData)
    clearSelectedSpots()
    reset()
    setShowForm(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          プラン作成
        </h2>
        {selectedSpots.length > 1 && (
          <div className="flex items-center gap-2 mr-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as TravelMode)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              aria-label="移動手段"
            >
              <option value="drive">車</option>
              <option value="walk">徒歩</option>
            </select>
            <button
              onClick={() => {
                const optimized = optimizeOrder(selectedSpots)
                reorderSelectedSpots(optimized)
                const segs = computeSegments(optimized).map(s => ({
                  distanceKm: s.distanceKm,
                  hours: estimateTravelTimeHours(s.distanceKm, mode)
                }))
                setSegments(segs)
              }}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              順序を最適化
            </button>
          </div>
        )}
        {selectedSpots.length > 0 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            プランを保存
          </button>
        )}
      </div>

      {selectedSpots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            スポットを選択してプランを作成しましょう
          </p>
          <p className="text-gray-400 text-sm mt-1">
            左のスポット一覧から「プランに追加」ボタンをクリック
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-3">
            選択中のスポット ({selectedSpots.length}件)
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedSpots.map((spot, index) => (
              <div
                key={spot.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <h3 className="font-medium text-gray-900 text-sm">{spot.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{spot.address}</p>
                  {segments[index] && (
                    <p className="text-xs text-gray-600 mt-1">
                      → {segments[index].distanceKm.toFixed(1)} km / 約{Math.round(segments[index].hours * 60)}分
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => removeSelectedSpot(spot.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  削除
                </button>
              </div>
            ))}
          </div>

          {segments.length > 0 && (
            <div className="flex justify-end text-sm text-gray-700">
              合計: {segments.reduce((a, s) => a + s.distanceKm, 0).toFixed(1)} km / 約{Math.round(segments.reduce((a, s) => a + s.hours, 0) * 60)}分
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プラン名 *
                </label>
                <input
                  {...register('title', { required: 'プラン名を入力してください' })}
                  type="text"
                  placeholder="例: 家族で楽しむ渋谷お出かけ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地域 *
                </label>
                <input
                  {...register('region', { required: '地域を入力してください' })}
                  type="text"
                  placeholder="例: 渋谷区"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.region && (
                  <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付 *
                </label>
                <input
                  {...register('date', { required: '日付を選択してください' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  {...register('description')}
                  placeholder="プランの詳細や注意点など"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {isLoading ? '保存中...' : 'プランを保存'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}

          {/* Collaboration: Comments and Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="bg-gray-50 rounded p-3">
              <h4 className="font-medium text-gray-800 mb-2">💬 コメント</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                {(inviteToken && currentPlan?.id ? serverComments : comments).map((c: any) => (
                  <div key={c.id} className="p-2 bg-white rounded border flex justify-between items-start gap-2">
                    <div>
                      <div className="text-xs text-gray-500">{c.author || 'ゲスト'}・{new Date(c.createdAt).toLocaleString('ja-JP')}</div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">{c.text}</div>
                    </div>
                    {inviteToken && currentPlan?.id ? (
                      <button onClick={async () => {
                        await fetch(`/api/plans/${currentPlan.id}/comments/${c.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${inviteToken}` }})
                        setServerComments(prev => prev.filter((x:any) => x.id !== c.id))
                      }} className="text-xs text-red-600">削除</button>
                    ) : (
                      <button onClick={() => deleteComment(c.id)} className="text-xs text-red-600">削除</button>
                    )}
                  </div>
                ))}
                {(inviteToken && currentPlan?.id ? serverComments.length === 0 : comments.length === 0) && (
                  <div className="text-xs text-gray-500">まだコメントはありません</div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="コメントを入力"
                />
                <button
                  onClick={async () => {
                    if (!commentText.trim()) return
                    if (inviteToken && currentPlan?.id) {
                      const res = await fetch(`/api/plans/${currentPlan.id}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${inviteToken}` },
                        body: JSON.stringify({ author: 'ゲスト', text: commentText.trim() })
                      })
                      if (res.ok) {
                        const created = await res.json()
                        setServerComments(prev => [created, ...prev])
                        setCommentText('')
                        return
                      }
                    }
                    addComment('ゲスト', commentText.trim()); setCommentText('')
                  }}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  送信
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <h4 className="font-medium text-gray-800 mb-2">✅ チェックリスト</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                {(inviteToken && currentPlan?.id ? serverChecklist : checklist).map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={i.done} onChange={async () => {
                        if (inviteToken && currentPlan?.id) {
                          const res = await fetch(`/api/plans/${currentPlan.id}/checklist/${i.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${inviteToken}` }, body: JSON.stringify({ done: !i.done }) })
                          if (res.ok) {
                            const upd = await res.json()
                            setServerChecklist(prev => prev.map((x:any) => x.id === i.id ? upd : x))
                            return
                          }
                        }
                        toggleChecklist(i.id)
                      }} />
                      <span className={i.done ? 'line-through text-gray-400' : 'text-gray-800'}>{i.text}</span>
                    </label>
                    <button onClick={async () => {
                      if (inviteToken && currentPlan?.id) {
                        await fetch(`/api/plans/${currentPlan.id}/checklist/${i.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${inviteToken}` } })
                        setServerChecklist(prev => prev.filter((x:any) => x.id !== i.id))
                        return
                      }
                      deleteChecklist(i.id)
                    }} className="text-xs text-red-600">削除</button>
                  </div>
                ))}
                {(inviteToken && currentPlan?.id ? serverChecklist.length === 0 : checklist.length === 0) && (
                  <div className="text-xs text-gray-500">チェック項目はありません</div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={checkText}
                  onChange={(e) => setCheckText(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="項目を追加"
                />
                <button
                  onClick={async () => {
                    if (!checkText.trim()) return
                    if (inviteToken && currentPlan?.id) {
                      const res = await fetch(`/api/plans/${currentPlan.id}/checklist`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${inviteToken}` }, body: JSON.stringify({ text: checkText.trim() }) })
                      if (res.ok) {
                        const created = await res.json()
                        setServerChecklist(prev => [...prev, created])
                        setCheckText('')
                        return
                      }
                    }
                    addChecklist(checkText.trim()); setCheckText('')
                  }}
                  className="text-sm px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  追加
                </button>
              </div>
            </div>
          </div>

          {/* Share link placeholder */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={async () => {
                const url = `${location.origin}${location.pathname}?share=plan`
                try { await navigator.clipboard.writeText(url) } catch {}
                alert('共有リンクをコピーしました')
              }}
              className="text-sm px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              共有リンクをコピー
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
