import React from 'react'

type BentoBoxProps = {
  children: React.ReactNode
  header?: React.ReactNode
  color?: 'default' | 'blue' | 'purple' | 'green' | 'yellow' | 'pink'
  className?: string
}

// Map logical colors to subtle gradient borders or subtle background glows
const colorStyles = {
  default: 'hover:border-white/20',
  blue: 'hover:border-brand-cyan/50 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]',
  purple: 'hover:border-brand-violet/50 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)]',
  green: 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]',
  yellow: 'hover:border-yellow-500/50 hover:shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]',
  pink: 'hover:border-brand-fuchsia/50 hover:shadow-[0_0_30px_-10px_rgba(217,70,239,0.3)]',
}

const headerColorStyles = {
  default: 'text-zinc-100 border-white/10',
  blue: 'text-brand-cyan border-brand-cyan/20',
  purple: 'text-brand-violet border-brand-violet/20',
  green: 'text-emerald-400 border-emerald-500/20',
  yellow: 'text-yellow-400 border-yellow-500/20',
  pink: 'text-brand-fuchsia border-brand-fuchsia/20',
}

export function BentoBox({ children, header, color = 'default', className = '' }: BentoBoxProps) {
  return (
    <div className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${colorStyles[color]} ${className}`}>
      {header && (
        <div className={`text-lg font-semibold tracking-wide border-b pb-3 mb-4 ${headerColorStyles[color]}`}>
          {header}
        </div>
      )}
      {children}
    </div>
  )
}
