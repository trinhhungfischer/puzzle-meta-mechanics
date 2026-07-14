'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Hexagon, Cards, Joystick, List } from '@phosphor-icons/react'

export function PublicNav() {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-fit">
      <nav className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2 rounded-full glass-panel shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10 mx-auto bg-zinc-950/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 pr-4 md:pr-6 border-r border-white/10 group no-underline text-zinc-100">
          <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-brand-accent group-hover:border-brand-accent group-hover:text-zinc-950 transition-all duration-300">
            <Hexagon weight="fill" className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-tight text-sm hidden sm:block">Puzzle Meta</span>
        </Link>
        
        <div className="flex items-center gap-1">
          <NavLink href="/" exact icon={<Joystick weight="duotone" className="w-4 h-4" />} label="Games" />
          <NavLink href="/mechanics" icon={<Cards weight="duotone" className="w-4 h-4" />} label="Mechanics" />
          <NavLink href="/genres" icon={<List weight="duotone" className="w-4 h-4" />} label="Genres" />
        </div>
      </nav>
    </div>
  )
}

function NavLink({ href, icon, label, exact = false }: { href: string; icon: React.ReactNode; label: string, exact?: boolean }) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname?.startsWith(href)

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 group no-underline ${
        isActive ? 'bg-brand-accent/10 text-brand-accent shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className={`transition-transform duration-300 origin-center ${
        isActive ? 'text-brand-accent' : 'text-zinc-500 group-hover:text-brand-accent group-hover:scale-110'
      }`}>
        {icon}
      </span>
      <span className="text-xs font-bold uppercase tracking-widest hidden md:block">{label}</span>
    </Link>
  )
}
