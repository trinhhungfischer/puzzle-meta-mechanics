import React from 'react'

type PillProps = {
  children: React.ReactNode
  color?: 'default' | 'pink' | 'blue' | 'purple' | 'green' | 'yellow'
  className?: string
}

const colorStyles = {
  default: 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10',
  pink: 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 hover:bg-fuchsia-500/20',
  blue: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20',
  purple: 'bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20',
  green: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 hover:bg-yellow-500/20',
}

export function Pill({ children, color = 'default', className = '' }: PillProps) {
  return (
    <span className={`inline-flex items-center text-[0.7rem] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors duration-200 ${colorStyles[color]} ${className}`}>
      {children}
    </span>
  )
}
