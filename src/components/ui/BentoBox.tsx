import React from 'react'

type BentoBoxProps = {
  children: React.ReactNode
  header?: React.ReactNode
  className?: string
  color?: 'default' | 'accent' | 'blue' | 'purple' | 'green' | 'yellow' | 'pink'
}

export function BentoBox({ children, header, className = '', color = 'default' }: BentoBoxProps) {
  // Map legacy colors to the new constrained aesthetic
  const isAccent = color === 'accent' || color === 'blue' || color === 'purple' || color === 'green' || color === 'pink'
  return (
    <div className={`glass-panel rounded-[2rem] p-8 transition-all duration-300 relative overflow-hidden group ${
      isAccent ? 'hover:border-brand-accent/50 hover:shadow-[0_0_40px_-15px_rgba(16,185,129,0.4)]' : 'hover:border-white/20'
    } ${className}`}>
      
      {/* Refraction edge */}
      <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] pointer-events-none rounded-[2rem]" />
      
      {/* Subtle hover fill */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
        isAccent ? 'bg-brand-accent/5 mix-blend-screen' : 'bg-white/5'
      }`} />

      <div className="relative z-10">
        {header && (
          <div className={`text-xl font-bold tracking-tight pb-4 mb-6 border-b ${
            isAccent ? 'text-brand-accent border-brand-accent/20' : 'text-zinc-100 border-white/5'
          }`}>
            {header}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
