'use client'

import { useState, useTransition } from 'react'
import { mergeDuplicateGames } from '../actions'

type GameLight = {
  id: string
  title: string
  slug: string
  status: string
  coverUrl: string | null
  platforms: { platform: { name: string } }[]
  genres: { name: string }[]
}

export default function DedupeList({ groups }: { groups: GameLight[][] }) {
  const [pending, startTransition] = useTransition()

  const mergeGroup = (canonicalId: string, allIds: string[]) => {
    const duplicateIds = allIds.filter(id => id !== canonicalId)
    if (duplicateIds.length === 0) return
    startTransition(async () => {
      await mergeDuplicateGames(canonicalId, duplicateIds)
    })
  }

  if (groups.length === 0) {
    return (
      <div className="glass-panel p-12 text-center text-zinc-500 rounded-2xl">
        No duplicates found! Your catalog is clean.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group, idx) => (
        <div key={idx} className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-4 text-brand-cyan">{group[0].title} (and similar)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.map(game => (
              <div key={game.id} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex flex-col relative">
                <div className="flex items-start gap-4 mb-4">
                  {game.coverUrl ? (
                    <img src={game.coverUrl} className="w-16 h-16 rounded object-cover" alt="" />
                  ) : (
                    <div className="w-16 h-16 rounded bg-zinc-800 flex items-center justify-center font-bold text-xl">
                      {game.title[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-bold mb-1">{game.title}</div>
                    <div className="text-xs text-zinc-400 mb-1">{game.slug}</div>
                    <div className="flex gap-1 flex-wrap">
                      <span className={`text-[10px] px-1.5 rounded ${game.status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {game.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-zinc-400 space-y-1 flex-1 mb-4">
                  <div><strong>Platforms:</strong> {game.platforms.map(p => p.platform.name).join(', ') || 'None'}</div>
                  <div><strong>Genres:</strong> {game.genres.map(g => g.name).join(', ') || 'None'}</div>
                </div>

                <button 
                  disabled={pending}
                  onClick={() => mergeGroup(game.id, group.map(g => g.id))}
                  className="w-full py-2 bg-brand-violet/20 hover:bg-brand-violet text-brand-violet hover:text-white transition-colors rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  Make Canonical & Merge
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
