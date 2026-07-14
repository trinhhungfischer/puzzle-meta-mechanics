import React from 'react'
import Link from 'next/link'

type Group = {
  id: string
  name: string
  description?: string | null
  mechanics: any[]
}

export function MechanicBoard({ groups }: { groups: Group[] }) {
  return (
    <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-6 pb-8 h-[calc(100vh-300px)] min-h-[500px] custom-scrollbar">
      {groups.map(group => (
        <section key={group.id} className="w-[300px] flex-shrink-0 snap-start flex flex-col glass-panel rounded-2xl border-white/5 bg-zinc-950/50 h-full">
          <div className="p-3.5 border-b border-white/5 bg-zinc-900/80 rounded-t-2xl sticky top-0 z-50 flex items-center justify-between gap-2 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white m-0 truncate">
                {group.name}
              </h2>
              <div className="group/tooltip relative flex items-center justify-center w-5 h-5 flex-shrink-0 rounded-full bg-zinc-800 text-zinc-400 hover:text-brand-accent hover:bg-brand-accent/10 cursor-help transition-colors">
                <span className="text-[10px] font-bold">?</span>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300 shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none whitespace-normal text-left font-normal leading-relaxed">
                  {group.description || 'Chưa có mô tả chi tiết cho category này.'}
                </div>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent text-[10px] font-bold flex-shrink-0">
              {group.mechanics.length}
            </div>
          </div>
          
          <div className="p-3 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            {group.mechanics.map(mechanic => {
              const gameCount = mechanic._count?.games ?? mechanic.games?.length ?? 0
              return (
                <Link 
                  key={mechanic.id} 
                  href={`/mechanics/${mechanic.slug}`} 
                  className="group/card block no-underline text-inherit flex-shrink-0"
                >
                  <div className="bg-zinc-900/60 border border-white/5 hover:border-brand-accent/50 hover:bg-zinc-900 hover:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.3)] rounded-xl p-3 transition-all duration-300 relative overflow-hidden">
                    <h3 className="text-sm font-bold tracking-tight text-white group-hover/card:text-brand-accent transition-colors line-clamp-1 mb-1.5">
                      {mechanic.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-auto">
                      {mechanic.games && mechanic.games.length > 0 ? (
                        <div className="flex -space-x-1.5">
                          {mechanic.games.slice(0, 4).map((gm: any, i: number) => (
                            gm.game.coverUrl ? (
                              <img key={i} src={gm.game.coverUrl} title={gm.game.title} className="w-5 h-5 rounded-full border border-zinc-900 object-cover shadow-sm" />
                            ) : (
                              <div key={i} title={gm.game.title} className="w-5 h-5 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-white uppercase shadow-sm">
                                {gm.game.title.charAt(0)}
                              </div>
                            )
                          ))}
                        </div>
                      ) : (
                        <div className="flex -space-x-1.5 opacity-30 grayscale">
                          <div className="w-5 h-5 rounded-full border border-zinc-900 bg-zinc-800" />
                          <div className="w-5 h-5 rounded-full border border-zinc-900 bg-zinc-800" />
                        </div>
                      )}
                      
                      <div className="text-[10px] font-mono font-medium text-zinc-500">
                        <span className="text-brand-accent font-bold">{gameCount}</span> 
                        {gameCount === 1 ? ' GAME' : ' GAMES'}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
