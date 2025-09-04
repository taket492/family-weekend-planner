'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  // Load initial theme from localStorage or prefers-color-scheme
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme | null
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved)
      } else {
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
      }
    } catch {}
  }, [])

  // Apply to html[data-theme]
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const el = document.documentElement
      el.setAttribute('data-theme', theme)
      // Enable Tailwind dark: utilities
      if (theme === 'dark') el.classList.add('dark'); else el.classList.remove('dark')
      try { localStorage.setItem('theme', theme) } catch {}
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
    set: setTheme,
  }), [theme])

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
