'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useTheme } from './ThemeProvider'

export default function AppHeader() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-[color-mix(in_oklab,var(--brand),transparent_85%)] text-[var(--brand)]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="glass elevate-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="size-8 rounded-lg bg-[var(--brand)] text-white grid place-items-center shadow-md group-hover:scale-105 transition-transform">🌤️</div>
              <div className="leading-tight">
                <div className="font-extrabold tracking-tight -mb-0.5">Family Weekend Planner</div>
                <div className="text-xs text-gray-500">家族のお出かけをもっと楽しく</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 ml-4">
              <NavLink href="/" label="スポット" />
              <NavLink href="/restaurants" label="レストラン" />
            </div>

            <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('command-palette:open'))}
              className="hidden sm:flex items-center gap-2 bg-white/60 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              aria-label="コマンドパレットを開く"
            >
              <span className="text-gray-400">⌘K</span>
              クイック検索
            </button>
              <Button size="sm" variant="secondary" className="hidden sm:inline-flex" onClick={toggle} aria-label="テーマ切り替え">
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
              <Link href="#main">
                <Button size="sm" className="shadow-sm">計画を作成</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
