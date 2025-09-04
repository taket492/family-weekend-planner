'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { toggle: toggleTheme } = useTheme()

  // Open with ⌘K / Ctrl+K or custom event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault(); setOpen(true)
      }
      if (open && e.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('command-palette:open', onOpen as EventListener)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('command-palette:open', onOpen as EventListener)
    }
  }, [open])

  const baseActions = useMemo(() => ([
    { id: 'search', label: '🔍 スポット検索タブ', perform: () => window.dispatchEvent(new CustomEvent('cmdk:tab:search')) },
    { id: 'add-spot', label: '📝 スポット登録タブ', perform: () => window.dispatchEvent(new CustomEvent('cmdk:tab:add-spot')) },
    { id: 'add-restaurant', label: '🍽️ レストラン登録タブ', perform: () => window.dispatchEvent(new CustomEvent('cmdk:tab:add-restaurant')) },
    { id: 'filters', label: '🔧 検索フィルターを開く', perform: () => window.dispatchEvent(new CustomEvent('filters:open')) },
    { id: 'view:list', label: '📄 リスト表示へ', perform: () => window.dispatchEvent(new CustomEvent('view:list')) },
    { id: 'view:map', label: '🗺️ 地図表示へ', perform: () => window.dispatchEvent(new CustomEvent('view:map')) },
    { id: 'theme', label: '🌗 テーマ切り替え', perform: () => toggleTheme() },
    { id: 'restaurants', label: '🍜 レストランページへ移動', perform: () => router.push('/restaurants') },
  ]), [router, toggleTheme])

  const keywordAction = query.trim().length > 0
    ? [{ id: `kw:${query}`, label: `🔎 キーワードで絞り込み: "${query}"`, perform: () => {
        window.dispatchEvent(new CustomEvent('filters:keyword', { detail: { keyword: query.trim() } }))
        window.dispatchEvent(new CustomEvent('cmdk:tab:search'))
      }}]
    : []

  const actions = [...keywordAction, ...baseActions]
  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-xl surface radius elevate-lg p-2">
        <div className="flex items-center gap-2 p-2 border-b border-gray-200/70 dark:border-white/10">
          <span className="text-gray-400">⌘K</span>
          <input
            autoFocus
            aria-label="コマンド検索"
            placeholder="コマンドやページを検索"
            className="w-full bg-transparent outline-none text-sm"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            onKeyDown={(e)=>{ if (e.key==='Enter' && filtered[0]) { filtered[0].perform(); setOpen(false) } }}
          />
          <button onClick={()=>setOpen(false)} aria-label="閉じる" className="text-gray-400 hover:text-gray-600">Esc</button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-1">
          {filtered.map(a => (
            <li key={a.id}>
              <button
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100/80 dark:hover:bg-white/5"
                onClick={()=>{ a.perform(); setOpen(false) }}
              >
                {a.label}
              </button>
            </li>
          ))}
          {!filtered.length && (
            <li className="px-3 py-3 text-sm text-gray-500">該当するコマンドがありません</li>
          )}
        </ul>
      </div>
    </div>
  )
}
