'use client'

import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--brand)] text-[var(--brand-contrast)] shadow-sm hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--brand),white_20%)]',
  secondary: 'bg-white/80 dark:bg-white/10 text-gray-900 dark:text-gray-100 border border-gray-200/80 dark:border-white/15 hover:bg-white dark:hover:bg-white/5',
  ghost: 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/5',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button className={[base, variants[variant], sizes[size], className].join(' ')} {...props} />
  )
}
