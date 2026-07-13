import React from 'react'
import Link from 'next/link'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 selection:bg-brand-fuchsia/30 selection:text-white">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-white/10 flex flex-col backdrop-blur-md z-40 relative">
        <div className="p-6 border-b border-white/10 bg-gradient-to-br from-zinc-800/50 to-transparent">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-brand-fuchsia flex items-center justify-center shadow-[0_0_15px_-3px_rgba(217,70,239,0.5)]">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <h2 className="font-bold tracking-tight text-white">Admin Portal</h2>
          </div>
          <Link href="/" className="text-xs text-zinc-500 hover:text-white hover:underline transition-colors block mt-2">
            &larr; Back to Public Site
          </Link>
        </div>
        <nav className="flex flex-row md:flex-col p-4 gap-1 overflow-x-auto">
          <AdminNavLink href="/admin/games">Games</AdminNavLink>
          <AdminNavLink href="/admin/mechanics">Mechanics</AdminNavLink>
          <AdminNavLink href="/admin/groups">Groups</AdminNavLink>
          <AdminNavLink href="/admin/genres">Genres</AdminNavLink>
          <AdminNavLink href="/admin/platforms">Platforms</AdminNavLink>
          <div className="my-3 mx-2 border-t md:border-l-0 border-white/10 hidden md:block" />
          <AdminNavLink href="/admin/import">JSON Import</AdminNavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {/* Subtle background glow for admin area */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

function AdminNavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap active:bg-white/10"
    >
      {children}
    </Link>
  )
}
