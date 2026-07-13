import React from 'react'
import Link from 'next/link'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-fuchsia/30 selection:text-white">
      <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl mb-12">
        <Link href="/" className="text-2xl font-bold tracking-tighter no-underline flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white text-sm font-black">P</span>
          </div>
          <span className="text-zinc-100 group-hover:text-white transition-colors">Puzzle Meta</span>
        </Link>
        <div className="flex flex-wrap gap-6">
          <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Games</Link>
          <Link href="/mechanics" className="text-sm font-medium text-zinc-400 hover:text-brand-violet transition-colors">Mechanics</Link>
          <Link href="/genres" className="text-sm font-medium text-zinc-400 hover:text-brand-fuchsia transition-colors">Genres</Link>
        </div>
      </nav>
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 pb-24">
        {children}
      </main>
      <footer className="border-t border-white/5 py-12 text-center text-sm text-zinc-600 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Puzzle Meta-Mechanic</span>
          <div className="flex gap-4">
            <Link href="/admin/games" className="hover:text-white transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
