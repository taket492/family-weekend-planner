'use client'

import React from 'react'

interface SegmentedControlProps<T extends string> {
  value: T
  options: { label: string; value: T }[]
  onChange: (value: T) => void
  className?: string
}

export default function SegmentedControl<T extends string>({ value, options, onChange, className = '' }: SegmentedControlProps<T>) {
  return (
    <div className={["inline-flex items-center p-1 bg-white/80 dark:bg-white/10 rounded-lg border border-gray-200/80 dark:border-white/15", className].join(' ')}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${active ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/5'}`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

