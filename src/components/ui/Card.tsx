'use client'

import React from 'react'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["surface radius elevate-md p-6 transition-shadow hover:elevate-lg", className].join(' ')}>
      {children}
    </div>
  )
}
