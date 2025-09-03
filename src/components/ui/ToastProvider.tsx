'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  title?: string
  message: string
  type?: ToastType
  duration?: number
}

interface ToastContextValue {
  show: (t: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const toast: Toast = { id, duration: 3500, type: 'info', ...t }
    setToasts((prev) => [...prev, toast])
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, toast.duration)
    // Avoid Node warnings in tests; no-op cleanup needed here
    return () => clearTimeout(timeout)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'min-w-[280px] max-w-sm rounded-md shadow-lg border px-4 py-3 text-sm',
              t.type === 'success' && 'bg-green-50 border-green-200 text-green-800',
              t.type === 'error' && 'bg-red-50 border-red-200 text-red-800',
              (!t.type || t.type === 'info') && 'bg-white border-gray-200 text-gray-800',
            ].filter(Boolean).join(' ')}
            role="status"
          >
            {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

