'use client'

import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = '', invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={[
          'w-full rounded-md border px-3 py-2 text-base',
          invalid ? 'border-red-500 focus:outline-red-500' : 'border-gray-300',
          className,
        ].join(' ')}
        {...props}
      />
    )
  }
)
