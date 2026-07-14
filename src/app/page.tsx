import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import GameFilters from '@/components/GameFilters'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { getGenres, getPlatforms, getMechanicsList, getMechanicGroups } from '@/lib/taxonomy'
import { GameGrid } from '@/components/ui/GameGrid'
import { GameGridSkeleton } from '@/components/ui/GameGridSkeleton'

export const metadata: Metadata = {
  title: 'Puzzle Meta-Mechanic Catalog',
  description: 'Explore thousands of systemic mechanics, genres, and the games that made them famous.',
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined
  const genre = typeof resolvedParams.genre === 'string' ? resolvedParams.genre : undefined
  const platform = typeof resolvedParams.platform === 'string' ? resolvedParams.platform : undefined
  const group = typeof resolvedParams.group === 'string' ? resolvedParams.group : undefined
  const minRatingRaw = typeof resolvedParams.minRating === 'string' ? Number(resolvedParams.minRating) : NaN
  const minRating = Number.isFinite(minRatingRaw) && minRatingRaw >= 0 ? minRatingRaw : undefined
  const maxRatingRaw = typeof resolvedParams.maxRating === 'string' ? Number(resolvedParams.maxRating) : NaN
  const maxRating = Number.isFinite(maxRatingRaw) && maxRatingRaw >= 0 ? maxRatingRaw : undefined

  const minDownloadsRaw = typeof resolvedParams.minDownloads === 'string' ? Number(resolvedParams.minDownloads) : NaN
  const minDownloads = Number.isFinite(minDownloadsRaw) && minDownloadsRaw >= 0 ? minDownloadsRaw : undefined
  const maxDownloadsRaw = typeof resolvedParams.maxDownloads === 'string' ? Number(resolvedParams.maxDownloads) : NaN
  const maxDownloads = Number.isFinite(maxDownloadsRaw) && maxDownloadsRaw >= 0 ? maxDownloadsRaw : undefined

  const minPriceRaw = typeof resolvedParams.minPrice === 'string' ? Number(resolvedParams.minPrice) : NaN
  const minPrice = Number.isFinite(minPriceRaw) && minPriceRaw >= 0 ? minPriceRaw : undefined
  const maxPriceRaw = typeof resolvedParams.maxPrice === 'string' ? Number(resolvedParams.maxPrice) : NaN
  const maxPrice = Number.isFinite(maxPriceRaw) && maxPriceRaw >= 0 ? maxPriceRaw : undefined

  const minYearRaw = typeof resolvedParams.minYear === 'string' ? Number(resolvedParams.minYear) : NaN
  const minYear = Number.isFinite(minYearRaw) && minYearRaw > 0 ? minYearRaw : undefined
  const maxYearRaw = typeof resolvedParams.maxYear === 'string' ? Number(resolvedParams.maxYear) : NaN
  const maxYear = Number.isFinite(maxYearRaw) && maxYearRaw > 0 ? maxYearRaw : undefined

  const freeOnly = resolvedParams.free === '1'
  const mechanicMode = typeof resolvedParams.mechanicMode === 'string' ? resolvedParams.mechanicMode : 'AND'
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'title'

  let mechanics: string[] = []
  if (typeof resolvedParams.mechanic === 'string') {
    mechanics = resolvedParams.mechanic.split(',').filter(Boolean)
  } else if (Array.isArray(resolvedParams.mechanic)) {
    mechanics = resolvedParams.mechanic.flatMap(s => s.split(',')).filter(Boolean)
  }

  const [allGenres, allPlatforms, allMechanics, allGroups] = await Promise.all([
    getGenres(),
    getPlatforms(),
    getMechanicsList(),
    getMechanicGroups(),
  ])

  // Key for Suspense to trigger fallback when params change
  const suspenseKey = JSON.stringify(resolvedParams)

  return (
    <PublicLayout>
      {/* Compact Header Bar */}
      <div className="relative mb-8 rounded-2xl overflow-hidden glass-panel p-6 flex flex-col sm:flex-row items-center justify-between border-white/5 gap-6">
        <div className="absolute inset-0 bg-zinc-950/80 z-0" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-brand-accent/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 items-center justify-center">
            <span className="text-xl text-brand-accent font-black">P</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              Puzzle Meta <span className="accent-text">Database</span>
            </h1>
            <p className="text-sm text-zinc-400 m-0">
              A high-fidelity catalog of systemic mechanics.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            Live DB
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <GameFilters
            genres={allGenres}
            platforms={allPlatforms}
            mechanics={allMechanics}
            groups={allGroups}
            currentQ={q}
            currentGenre={genre}
            currentPlatform={platform}
            currentGroup={group}
            currentMechanics={mechanics}
            currentMechanicMode={mechanicMode}
            currentSort={sort}
            currentMinRating={minRating}
            currentMaxRating={maxRating}
            currentMinDownloads={minDownloads}
            currentMaxDownloads={maxDownloads}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentMinYear={minYear}
            currentMaxYear={maxYear}
            currentFreeOnly={freeOnly}
          />
        </aside>

        {/* Results */}
        <Suspense key={suspenseKey} fallback={<GameGridSkeleton />}>
          <GameGrid searchParams={resolvedParams} />
        </Suspense>
      </div>
    </PublicLayout>
  )
}
