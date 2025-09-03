'use client'

import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  onClear?: () => void
}

export function Badge({ children, onClear }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200 px-2.5 py-1 text-xs">
      {children}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-gray-200"
          aria-label="クリア"
        >
          ×
        </button>
      )}
    </span>
  )
}

