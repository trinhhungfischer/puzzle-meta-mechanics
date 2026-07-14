import React from 'react'
import Link from 'next/link'
import { PublicNav } from './PublicNav'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-zinc-950 selection:bg-brand-accent/30 selection:text-white">
      {/* Floating Dynamic Island Nav */}
      <PublicNav />

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 pt-32 pb-24">
        {children}
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-sm text-zinc-600 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Puzzle Meta-Mechanic</span>
          <div className="flex gap-4">
            <Link href="/admin/games" className="hover:text-brand-accent transition-colors no-underline">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
