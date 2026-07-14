'use client'

import React, { useState } from 'react'
import MechanicFilters from './MechanicFilters'
import { MechanicBoard } from '@/components/ui/MechanicBoard'
import { MechanicCard } from '@/components/ui/MechanicCard'

type Props = {
  allGroupsForFilter: { name: string, slug: string }[]
  visibleGroups: any[]
  initialQ?: string
  initialGroup?: string
  initialSort?: string
  initialView?: string
}

export default function MechanicViewManager({
  allGroupsForFilter,
  visibleGroups,
  initialQ,
  initialGroup,
  initialSort,
  initialView = 'grid'
}: Props) {
  const [view, setView] = useState(initialView)

  return (
    <>
      <MechanicFilters 
        groups={allGroupsForFilter} 
        currentQ={initialQ} 
        currentGroup={initialGroup} 
        currentSort={initialSort} 
        currentView={view}
        onViewChange={setView}
      />

      {visibleGroups.length === 0 && (
        <div className="p-12 text-center opacity-50 bg-black/10 rounded-xl border border-outline/50">
          <p className="text-xl font-bold">No mechanics found matching your filters.</p>
        </div>
      )}

      {visibleGroups.length > 0 && view === 'board' ? (
        <MechanicBoard groups={visibleGroups} />
      ) : (
        visibleGroups.map(group => (
          <section key={group.id} className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-2 h-8 bg-brand-accent rounded-full" />
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-white m-0">
                  {group.name}
                </h2>
                <div className="group/tooltip relative flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 hover:text-brand-accent hover:bg-brand-accent/10 cursor-help transition-colors">
                  <span className="text-xs font-bold">?</span>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-4 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-300 shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none whitespace-normal text-left font-normal leading-relaxed">
                    {group.description || 'Chưa có mô tả chi tiết cho category này.'}
                  </div>
                </div>
              </div>
              <div className="h-px flex-1 bg-white/5 ml-4" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.mechanics.map((mechanic: any) => (
                <MechanicCard key={mechanic.id} mechanic={mechanic} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
