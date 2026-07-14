import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pill } from './Pill'
import { PlatformIcon } from './PlatformIcon'

type GameCardProps = {
  game: {
    id: string
    slug: string
    title: string
    coverUrl?: string | null
    genres?: { id: string; name: string }[]
    mechanics?: { mechanicId: string; mechanic?: { id: string; name: string }, role: string }[]
    platforms?: { platformId: string; platform: { id: string; name: string } }[]
    ratingScore?: number | null
    downloads?: number | null
    isFree?: boolean
    price?: number | null
  }
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className="group block h-full no-underline text-inherit">
      <div className="glass-panel glass-panel-hover flex flex-col h-full rounded-[2rem] overflow-hidden relative">
        {/* Hover Spotlight Gradient */}
        <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-screen" />

        {/* Cover */}
        <div className="relative h-[220px] w-full overflow-hidden border-b border-white/5 bg-zinc-900 shrink-0">
          {game.coverUrl ? (
            <Image 
              src={game.coverUrl} 
              alt={`${game.title} cover`} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <span className="text-8xl font-black opacity-10 tracking-tighter uppercase text-brand-accent">{game.title[0]}</span>
            </div>
          )}
          {/* Edge Refraction */}
          <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-6 flex-grow flex flex-col relative z-10 bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {game.genres?.map(g => (
              <span key={g.id} className="text-[10px] font-bold tracking-widest uppercase text-brand-accent/80">
                {g.name}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-4 leading-tight text-white group-hover:text-brand-accent transition-colors line-clamp-2">
            {game.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mb-6 font-mono text-xs text-zinc-400">
            {game.ratingScore !== null && game.ratingScore !== undefined && (
              <span className="flex items-center gap-1 text-zinc-300">
                ★ {game.ratingScore}
              </span>
            )}
            {game.downloads !== null && game.downloads !== undefined && (
              <span className="flex items-center gap-1 text-zinc-300">
                ↓ {game.downloads >= 1000000 
                  ? `${(game.downloads / 1000000).toFixed(1)}M` 
                  : game.downloads >= 1000 
                    ? `${Math.floor(game.downloads / 1000)}k` 
                    : game.downloads}
              </span>
            )}
            {game.isFree ? (
              <span className="text-brand-accent font-bold">FREE</span>
            ) : game.price !== null && game.price !== undefined ? (
              <span className="text-zinc-300">${game.price.toFixed(2)}</span>
            ) : null}
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-zinc-500">
              {game.platforms?.map(p => (
                <PlatformIcon key={p.platformId} name={p.platform.name} className="w-4 h-4" />
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 justify-end">
              {game.mechanics?.slice(0, 3).map(m => (
                <Pill key={m.mechanicId} color={m.role === 'core' ? 'default' : 'purple'} className="!text-[0.6rem] !bg-zinc-900 border-white/10 !text-zinc-400 group-hover:border-brand-accent/30 group-hover:text-zinc-300 transition-colors">
                  <span className="truncate max-w-[80px] sm:max-w-[110px] block" title={m.mechanic?.name || 'Mechanic'}>
                    {m.mechanic?.name || 'Mechanic'}
                  </span>
                </Pill>
              ))}
              {game.mechanics && game.mechanics.length > 3 && (
                <span className="text-[0.6rem] font-bold text-zinc-600 px-1 py-0.5">+{game.mechanics.length - 3}</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </Link>
  )
}
