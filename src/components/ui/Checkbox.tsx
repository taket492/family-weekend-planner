'use client'

import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        className={[
          'rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500',
          className,
        ].join(' ')}
        {...props}
      />
      {label && <span className="text-sm text-gray-700 select-none">{label}</span>}
    </label>
  )
}

