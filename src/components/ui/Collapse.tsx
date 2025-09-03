'use client'

import React, { useState } from 'react'

export function Collapse({ title, children, defaultOpen = true }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-md">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-800">{title}</span>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pt-2 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

