import React from 'react'
import Link from 'next/link'

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
      <div className="glass-panel glass-panel-hover p-6 h-full flex flex-col rounded-2xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-violet/10 rounded-full blur-3xl group-hover:bg-brand-violet/20 transition-colors" />

        <h3 className="text-xl font-bold tracking-tight mb-3 text-brand-violet group-hover:text-violet-300 transition-colors z-10">
          {mechanic.name}
        </h3>
        
        {mechanic.description ? (
          <p className="text-zinc-400 text-sm mb-6 line-clamp-3 flex-grow z-10 leading-relaxed">
            {mechanic.description}
          </p>
        ) : (
          <div className="flex-grow mb-6 z-10" />
        )}
        
        <div className="mt-auto pt-4 border-t border-white/5 z-10 flex items-center gap-3">
          {mechanic.games && mechanic.games.length > 0 && (
            <div className="flex -space-x-2">
              {mechanic.games.map((gm, i) => (
                gm.game.coverUrl ? (
                  <img key={i} src={gm.game.coverUrl} title={gm.game.title} className="w-6 h-6 rounded-full border border-zinc-900 object-cover" />
                ) : (
                  <div key={i} title={gm.game.title} className="w-6 h-6 rounded-full border border-zinc-900 bg-brand-violet/50 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {gm.game.title.charAt(0)}
                  </div>
                )
              ))}
            </div>
          )}
          <div className="text-xs font-medium text-zinc-500 flex items-center gap-2">
            {(!mechanic.games || mechanic.games.length === 0) && <span className="w-1.5 h-1.5 rounded-full bg-brand-violet/50" />}
            Used in {gameCount} game{gameCount !== 1 ? 's' : ''}
          </div>
        </div>

      </div>
    </Link>
  )
}
