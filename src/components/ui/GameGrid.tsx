import prisma from '@/lib/prisma'
import Link from 'next/link'
import { GameCard } from './GameCard'

const PAGE_SIZE = 24

export async function GameGrid({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
  const genre = typeof searchParams.genre === 'string' ? searchParams.genre : undefined
  const platform = typeof searchParams.platform === 'string' ? searchParams.platform : undefined
  const group = typeof searchParams.group === 'string' ? searchParams.group : undefined
  const minRatingRaw = typeof searchParams.minRating === 'string' ? Number(searchParams.minRating) : NaN
  const minRating = Number.isFinite(minRatingRaw) && minRatingRaw >= 0 ? minRatingRaw : undefined
  const maxRatingRaw = typeof searchParams.maxRating === 'string' ? Number(searchParams.maxRating) : NaN
  const maxRating = Number.isFinite(maxRatingRaw) && maxRatingRaw >= 0 ? maxRatingRaw : undefined

  const minDownloadsRaw = typeof searchParams.minDownloads === 'string' ? Number(searchParams.minDownloads) : NaN
  const minDownloads = Number.isFinite(minDownloadsRaw) && minDownloadsRaw >= 0 ? minDownloadsRaw : undefined
  const maxDownloadsRaw = typeof searchParams.maxDownloads === 'string' ? Number(searchParams.maxDownloads) : NaN
  const maxDownloads = Number.isFinite(maxDownloadsRaw) && maxDownloadsRaw >= 0 ? maxDownloadsRaw : undefined

  const minPriceRaw = typeof searchParams.minPrice === 'string' ? Number(searchParams.minPrice) : NaN
  const minPrice = Number.isFinite(minPriceRaw) && minPriceRaw >= 0 ? minPriceRaw : undefined
  const maxPriceRaw = typeof searchParams.maxPrice === 'string' ? Number(searchParams.maxPrice) : NaN
  const maxPrice = Number.isFinite(maxPriceRaw) && maxPriceRaw >= 0 ? maxPriceRaw : undefined

  const minYearRaw = typeof searchParams.minYear === 'string' ? Number(searchParams.minYear) : NaN
  const minYear = Number.isFinite(minYearRaw) && minYearRaw > 0 ? minYearRaw : undefined
  const maxYearRaw = typeof searchParams.maxYear === 'string' ? Number(searchParams.maxYear) : NaN
  const maxYear = Number.isFinite(maxYearRaw) && maxYearRaw > 0 ? maxYearRaw : undefined

  const freeOnly = searchParams.free === '1'
  const mechanicMode = typeof searchParams.mechanicMode === 'string' ? searchParams.mechanicMode : 'AND'
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'title'
  const page = Math.max(1, parseInt(typeof searchParams.page === 'string' ? searchParams.page : '1', 10) || 1)

  let mechanics: string[] = []
  if (typeof searchParams.mechanic === 'string') {
    mechanics = searchParams.mechanic.split(',').filter(Boolean)
  } else if (Array.isArray(searchParams.mechanic)) {
    mechanics = searchParams.mechanic.flatMap(s => s.split(',')).filter(Boolean)
  }

  const where: any = { status: 'published' }

  if (q) where.title = { contains: q }
  if (genre) where.genres = { some: { slug: genre } }
  if (platform) where.platforms = { some: { platform: { slug: platform } } }
  if (group) where.mechanics = { some: { mechanic: { group: { slug: group } } } }

  if (minRating !== undefined || maxRating !== undefined) {
    where.ratingScore = {
      ...(minRating !== undefined && { gte: minRating }),
      ...(maxRating !== undefined && { lte: maxRating })
    }
  }

  if (minDownloads !== undefined || maxDownloads !== undefined) {
    where.downloads = {
      ...(minDownloads !== undefined && { gte: minDownloads }),
      ...(maxDownloads !== undefined && { lte: maxDownloads })
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice })
    }
  }

  if (minYear !== undefined || maxYear !== undefined) {
    where.releaseYear = {
      ...(minYear !== undefined && { gte: minYear }),
      ...(maxYear !== undefined && { lte: maxYear })
    }
  }

  if (freeOnly) where.isFree = true

  if (mechanics.length > 0) {
    if (mechanicMode === 'OR') {
      where.mechanics = { some: { mechanic: { slug: { in: mechanics } } } }
    } else {
      where.AND = [
        ...(where.AND || []),
        ...mechanics.map(mechSlug => ({
          mechanics: { some: { mechanic: { slug: mechSlug } } }
        }))
      ]
    }
  }

  const orderBy: any =
    sort === 'rating' ? { ratingScore: { sort: 'desc', nulls: 'last' } } :
    sort === 'downloads' ? { downloads: { sort: 'desc', nulls: 'last' } } :
    sort === 'reviews' ? { reviewCount: { sort: 'desc', nulls: 'last' } } :
    sort === 'year' ? { releaseYear: { sort: 'desc', nulls: 'last' } } :
    { title: 'asc' }

  const [total, games] = await Promise.all([
    prisma.game.count({ where }),
    prisma.game.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      relationLoadStrategy: 'join',
      select: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        ratingScore: true,
        downloads: true,
        isFree: true,
        price: true,
        genres: { select: { id: true, name: true, slug: true } },
        platforms: { 
          select: { 
            platformId: true, 
            platform: { select: { id: true, name: true, slug: true } } 
          } 
        },
        mechanics: { 
          take: 6,
          orderBy: { role: 'asc' },
          select: { 
            mechanicId: true, 
            role: true,
            mechanic: { select: { id: true, name: true, slug: true } } 
          } 
        }
      }
    })
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (genre) params.set('genre', genre)
    if (platform) params.set('platform', platform)
    if (group) params.set('group', group)
    if (mechanics.length > 0) {
      params.set('mechanic', mechanics.join(','))
      if (mechanicMode !== 'AND') params.set('mechanicMode', mechanicMode)
    }
    if (sort !== 'title') params.set('sort', sort)
    if (minRating !== undefined) params.set('minRating', String(minRating))
    if (maxRating !== undefined) params.set('maxRating', String(maxRating))
    if (minDownloads !== undefined) params.set('minDownloads', String(minDownloads))
    if (maxDownloads !== undefined) params.set('maxDownloads', String(maxDownloads))
    if (minPrice !== undefined) params.set('minPrice', String(minPrice))
    if (maxPrice !== undefined) params.set('maxPrice', String(maxPrice))
    if (minYear !== undefined) params.set('minYear', String(minYear))
    if (maxYear !== undefined) params.set('maxYear', String(maxYear))
    if (freeOnly) params.set('free', '1')
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/?${s}` : '/'
  }

  const pageNumbers: number[] = []
  const from = Math.max(1, page - 2)
  const to = Math.min(totalPages, from + 4)
  for (let p = Math.max(1, to - 4); p <= to; p++) pageNumbers.push(p)

  return (
    <div className="flex-1 w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-zinc-400 text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-cyan/50" />
          {total} matching game{total !== 1 && 's'}
          {totalPages > 1 && <span className="opacity-60">· page {page} of {totalPages}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {games.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center text-zinc-500">
          No games match these filters.
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              ← Prev
            </Link>
          )}
          {pageNumbers[0] > 1 && (
            <>
              <Link href={pageHref(1)} className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10">1</Link>
              <span className="px-1 text-zinc-600">…</span>
            </>
          )}
          {pageNumbers.map(p => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                p === page
                  ? 'bg-brand-violet/20 border-brand-violet/40 text-white'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300'
              }`}
            >
              {p}
            </Link>
          ))}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              <span className="px-1 text-zinc-600">…</span>
              <Link href={pageHref(totalPages)} className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10">{totalPages}</Link>
            </>
          )}
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
