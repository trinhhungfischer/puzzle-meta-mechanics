import React from 'react'
import Link from 'next/link'
import { Pill } from './Pill'

type GameCardProps = {
  game: {
    id: string
    slug: string
    title: string
    coverUrl?: string | null
    genres?: { id: string; name: string }[]
    mechanics?: { mechanicId: string; mechanic?: { id: string; name: string }, role: string }[]
  }
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className="group block h-full no-underline text-inherit">
      <div className="glass-panel glass-panel-hover flex flex-col h-full rounded-2xl overflow-hidden">
        
        {/* Cover */}
        <div className="relative h-[200px] w-full overflow-hidden border-b border-white/5 bg-zinc-900">
          {game.coverUrl ? (
            <img 
              src={game.coverUrl} 
              alt={`${game.title} cover`} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-cyan/20 to-brand-violet/20">
              <span className="text-6xl font-bold opacity-30 tracking-tighter uppercase">{game.title[0]}</span>
            </div>
          )}
          {/* Subtle gradient overlay to blend image with card */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5 flex-grow flex flex-col relative z-10 -mt-8">
          <h2 className="text-xl font-bold tracking-tight mb-3 leading-tight drop-shadow-md text-white group-hover:text-brand-cyan transition-colors">
            {game.title}
          </h2>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {game.genres?.map(g => (
              <Pill key={g.id} color="pink">{g.name}</Pill>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
            {game.mechanics?.slice(0, 5).map(m => (
              <Pill key={m.mechanicId} color={m.role === 'core' ? 'default' : 'purple'} className="!text-[0.6rem]">
                {m.mechanic?.name || 'Mechanic'}
              </Pill>
            ))}
            {game.mechanics && game.mechanics.length > 5 && (
              <Pill color="default" className="!text-[0.6rem]">+{game.mechanics.length - 5}</Pill>
            )}
          </div>
        </div>

      </div>
    </Link>
  )
}
