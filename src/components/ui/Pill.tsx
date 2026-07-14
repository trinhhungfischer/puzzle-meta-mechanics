import React from 'react'

type PillProps = {
  children: React.ReactNode
  color?: 'default' | 'accent' | 'blue' | 'purple' | 'green' | 'yellow' | 'pink'
  className?: string
}

// Map logical colors to refined variants (keeping legacy prop names to prevent breaks, mapping them to monochrome/accent)
const colorStyles = {
  default: 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10 hover:border-white/20',
  accent: 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent/20 hover:border-brand-accent/40',
  pink: 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent/20',
  blue: 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10',
  purple: 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10',
  green: 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent/20',
  yellow: 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10',
}

export function Pill({ children, color = 'default', className = '' }: PillProps) {
  return (
    <span className={`inline-flex items-center text-[0.7rem] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${colorStyles[color] || colorStyles.default} ${className}`}>
      {children}
    </span>
  )
}
