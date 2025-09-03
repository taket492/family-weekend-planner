'use client'

import React from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ className = '', invalid, children, ...props }: SelectProps) {
  return (
    <select
      className={[
        'w-full rounded-md border px-3 py-2 text-base',
        invalid ? 'border-red-500 focus:outline-red-500' : 'border-gray-300',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </select>
  )}

