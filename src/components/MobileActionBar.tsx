'use client'

import { Button } from './ui/Button'

interface Props {
  viewMode: 'list' | 'map'
  onToggleView: () => void
  onOpenFilters: () => void
}

export default function MobileActionBar({ viewMode, onToggleView, onOpenFilters }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="glass border-t border-gray-200/70 dark:border-white/10">
        <div className="px-4 py-2 flex items-center justify-between gap-2">
          <Button size="sm" variant="secondary" className="flex-1" onClick={onOpenFilters} aria-label="検索フィルターを開く">🔧 フィルター</Button>
          <Button size="sm" variant="secondary" className="flex-1" onClick={onToggleView} aria-label="表示モードを切替">
            {viewMode === 'list' ? '🗺️ 地図' : '📄 リスト'}
          </Button>
          <a href="#main" className="flex-1">
            <Button size="sm" className="w-full" aria-label="計画作成へ移動">🧭 作成</Button>
          </a>
        </div>
      </div>
    </div>
  )
}
