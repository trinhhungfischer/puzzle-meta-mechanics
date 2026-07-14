import prisma from '@/lib/prisma'
import GameFilters from '@/components/GameFilters'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { GameCard } from '@/components/ui/GameCard'
import { getGenres, getPlatforms, getMechanicsList } from '@/lib/taxonomy'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined
  const genre = typeof resolvedParams.genre === 'string' ? resolvedParams.genre : undefined
  const platform = typeof resolvedParams.platform === 'string' ? resolvedParams.platform : undefined
  const minRatingRaw = typeof resolvedParams.minRating === 'string' ? Number(resolvedParams.minRating) : NaN
  const minRating = Number.isFinite(minRatingRaw) && minRatingRaw > 0 ? minRatingRaw : undefined
  const freeOnly = resolvedParams.free === '1'
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'title'

  let mechanics: string[] = []
  if (typeof resolvedParams.mechanic === 'string') {
    mechanics = resolvedParams.mechanic.split(',').filter(Boolean)
  } else if (Array.isArray(resolvedParams.mechanic)) {
    mechanics = resolvedParams.mechanic.flatMap(s => s.split(',')).filter(Boolean)
  }

  const where: any = { status: 'published' }

  if (q) {
    where.title = { contains: q }
  }

  if (genre) {
    where.genres = { some: { slug: genre } }
  }

  if (platform) {
    where.platforms = { some: { platform: { slug: platform } } }
  }

  if (minRating !== undefined) {
    where.ratingScore = { gte: minRating }
  }

  if (freeOnly) {
    where.isFree = true
  }

  if (mechanics.length > 0) {
    where.AND = mechanics.map(mechSlug => ({
      mechanics: { some: { mechanic: { slug: mechSlug } } }
    }))
  }

  // SQLite sorts NULLs first ascending / last descending, so metric desc sorts
  // put games with no data at the bottom — the behaviour we want.
  const orderBy: any =
    sort === 'rating' ? { ratingScore: 'desc' } :
    sort === 'downloads' ? { downloads: 'desc' } :
    sort === 'reviews' ? { reviewCount: 'desc' } :
    sort === 'year' ? { releaseYear: 'desc' } :
    { title: 'asc' }

  const [games, allGenres, allPlatforms, allMechanics] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy,
      relationLoadStrategy: 'join', // single JOIN instead of one round-trip per relation
      include: {
        genres: true,
        platforms: { include: { platform: true } },
        mechanics: { include: { mechanic: true } }
      }
    }),
    getGenres(),
    getPlatforms(),
    getMechanicsList(),
  ])

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative mb-16 rounded-3xl overflow-hidden glass-panel p-12 text-center flex flex-col items-center justify-center border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/10 via-zinc-950 to-brand-violet/10 z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-violet/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-cyan/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            The Ultimate <br/> <span className="gradient-text">Puzzle Meta</span> Database
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-0 leading-relaxed font-medium">
            Explore thousands of systemic mechanics, genres, and the games that made them famous.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <GameFilters
            genres={allGenres}
            platforms={allPlatforms}
            mechanics={allMechanics}
            currentQ={q}
            currentGenre={genre}
            currentPlatform={platform}
            currentMechanics={mechanics}
            currentSort={sort}
            currentMinRating={minRating}
            currentFreeOnly={freeOnly}
          />
        </aside>

        {/* Results */}
        <div className="flex-1 w-full">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-zinc-400 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-cyan/50" />
              Showing {games.length} matching game{games.length !== 1 && 's'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
