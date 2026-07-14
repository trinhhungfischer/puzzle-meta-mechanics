import prisma from '@/lib/prisma'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { MechanicCard } from '@/components/ui/MechanicCard'
import { MechanicBoard } from '@/components/ui/MechanicBoard'
import { Button } from '@/components/ui/Button'
import { getCachedMechanicGroupsWithGames } from '@/lib/taxonomy'

import MechanicViewManager from './MechanicViewManager'

export default async function MechanicsPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, group?: string, sort?: string, view?: string }>
}) {
  const resolvedParams = await searchParams
  const q = resolvedParams.q
  const groupFilter = resolvedParams.group
  const sort = resolvedParams.sort || 'alpha'
  const view = resolvedParams.view || 'grid'

  const allGroupsForFilter = await prisma.mechanicGroup.findMany({
    orderBy: { name: 'asc' },
    select: { name: true, slug: true }
  })

  // Fetch fully cached data
  const cachedGroups = await getCachedMechanicGroupsWithGames()

  // 1. Clone to avoid mutating cache
  let groups = cachedGroups.map(g => ({
    ...g,
    mechanics: [...g.mechanics]
  }))

  // 2. Filter by group slug if needed
  if (groupFilter) {
    groups = groups.filter(g => g.slug === groupFilter)
  }

  // 3. Filter mechanics by search query `q`
  if (q) {
    const lowerQ = q.toLowerCase()
    groups.forEach(g => {
      g.mechanics = g.mechanics.filter(m => m.name.toLowerCase().includes(lowerQ))
    })
  }

  // 4. Sort mechanics
  if (sort === 'usage') {
    groups.forEach(g => {
      g.mechanics.sort((a, b) => b._count.games - a._count.games)
    })
  } else {
    groups.forEach(g => {
      g.mechanics.sort((a, b) => a.name.localeCompare(b.name))
    })
  }

  // 5. Filter out groups that have no mechanics matching the search
  const visibleGroups = groups.filter(g => g.mechanics.length > 0)

  return (
    <PublicLayout>
      <div className="relative mb-8 rounded-2xl overflow-hidden glass-panel p-6 flex flex-col sm:flex-row items-center justify-between border-white/5 gap-6">
        <div className="absolute inset-0 bg-zinc-950/80 z-0" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-brand-accent/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 items-center justify-center">
            <span className="text-xl text-brand-accent font-black">M</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              Mechanics <span className="accent-text">Encyclopedia</span>
            </h1>
            <p className="text-sm text-zinc-400 m-0">
              Atomic building blocks organized by systemic function.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold">
            {groups.length} Functional Groups
          </div>
        </div>
      </div>

      <MechanicViewManager 
        allGroupsForFilter={allGroupsForFilter}
        visibleGroups={visibleGroups}
        initialQ={q}
        initialGroup={groupFilter}
        initialSort={sort}
        initialView={view}
      />
    </PublicLayout>
  )
}
