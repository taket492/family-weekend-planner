'use client'

import React, { useEffect, useRef, useState } from 'react'

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  buttonAriaLabel?: string
}

export function Dropdown({ trigger, children, align = 'right', buttonAriaLabel }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={buttonAriaLabel}
        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-2 py-1 text-sm shadow-sm hover:bg-gray-50"
        onClick={() => setOpen(v => !v)}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-20 mt-2 w-56 origin-top-${align} rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ children, onClick, href, disabled = false }: { children: React.ReactNode; onClick?: () => void; href?: string; disabled?: boolean }) {
  const className = `block w-full text-left px-3 py-2 text-sm ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`
  if (href && !disabled) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    )
  }
  return (
    <button type="button" className={className} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {children}
    </button>
  )
}

