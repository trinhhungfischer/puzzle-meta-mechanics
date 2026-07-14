import React from 'react'
import Link from 'next/link'
import { BentoBox } from '@/components/ui/BentoBox'

type MechanicCardProps = {
  mechanic: {
    id: string
    slug: string
    name: string
    description?: string | null
    games?: { game: { title: string, coverUrl: string | null } }[]
    _count?: { games: number }
  }
}

export function MechanicCard({ mechanic }: MechanicCardProps) {
  const gameCount = mechanic._count?.games ?? mechanic.games?.length ?? 0

  return (
    <Link href={`/mechanics/${mechanic.slug}`} className="group block h-full no-underline text-inherit">
      <BentoBox className="h-full flex flex-col !p-6" color="default">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-brand-accent transition-colors z-10 line-clamp-2">
            {mechanic.name}
          </h3>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-accent -translate-x-2 group-hover:translate-x-0 duration-300">
            →
          </span>
        </div>
        
        {mechanic.description ? (
          <p className="text-zinc-400 text-sm mb-8 line-clamp-3 flex-grow z-10 leading-relaxed">
            {mechanic.description}
          </p>
        ) : (
          <div className="flex-grow mb-8 z-10" />
        )}
        
        <div className="mt-auto pt-4 border-t border-white/5 z-10 flex items-center justify-between gap-3">
          {mechanic.games && mechanic.games.length > 0 ? (
            <div className="flex -space-x-2">
              {mechanic.games.slice(0, 4).map((gm, i) => (
                gm.game.coverUrl ? (
                  <img key={i} src={gm.game.coverUrl} title={gm.game.title} className="w-7 h-7 rounded-full border border-zinc-900 object-cover shadow-md" />
                ) : (
                  <div key={i} title={gm.game.title} className="w-7 h-7 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-md">
                    {gm.game.title.charAt(0)}
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="flex -space-x-2 opacity-50 grayscale">
              <div className="w-7 h-7 rounded-full border border-zinc-900 bg-zinc-800" />
              <div className="w-7 h-7 rounded-full border border-zinc-900 bg-zinc-800" />
            </div>
          )}
          
          <div className="text-[11px] font-mono font-medium text-zinc-500 flex items-center gap-2">
            <span className="text-brand-accent font-bold">{gameCount}</span> 
            {gameCount === 1 ? 'GAME' : 'GAMES'}
          </div>
        </div>
      </BentoBox>
    </Link>
  )
}
