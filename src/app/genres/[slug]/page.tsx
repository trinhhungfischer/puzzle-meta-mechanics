import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { GameCard } from '@/components/ui/GameCard'

export default async function GenreDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const page = Math.max(1, parseInt(resolvedSearch.page || '1', 10) || 1)
  const PAGE_SIZE = 24

  const genre = await prisma.genre.findUnique({
    where: { slug: resolvedParams.slug },
  })

  if (!genre) {
    notFound()
  }

  const where = { status: 'published', genres: { some: { slug: genre.slug } } }

  const [total, games] = await Promise.all([
    prisma.game.count({ where }),
    prisma.game.findMany({
      where,
      orderBy: { title: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      relationLoadStrategy: 'join',
      include: {
        genres: true,
        platforms: { include: { platform: true } },
        mechanics: { include: { mechanic: true } }
      }
    })
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageNumbers: number[] = []
  const from = Math.max(1, page - 2)
  const to = Math.min(totalPages, from + 4)
  for (let p = Math.max(1, to - 4); p <= to; p++) pageNumbers.push(p)

  return (
    <PublicLayout>
      <Link href="/genres" className="inline-block opacity-80 mb-8 hover:underline">
        &larr; Back to Genres
      </Link>

      <header className="mb-16 rounded-3xl overflow-hidden glass-panel p-12 relative border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-fuchsia/10 to-transparent z-0" />
        <div className="relative z-10">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-brand-fuchsia">
            {genre.name}
          </h1>
          {genre.description && (
            <p className="text-xl leading-relaxed text-zinc-300 max-w-prose">
              {genre.description}
            </p>
          )}
        </div>
      </header>

      <section>
        <div className="flex justify-between items-end border-b-4 border-outline pb-2 mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">
            Games in {genre.name}
          </h2>
          <span className="text-zinc-400 font-medium">
            {total} game{total !== 1 && 's'}
          </span>
        </div>
        
        {games.length === 0 ? (
          <p className="opacity-70 text-lg">No games found in this genre.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map(game => (
              <GameCard key={game.id} game={game as any} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {page > 1 && (
              <Link href={`?page=${page - 1}`} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                ← Prev
              </Link>
            )}
            {pageNumbers[0] > 1 && (
              <>
                <Link href="?page=1" className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10">1</Link>
                <span className="px-1 text-zinc-600">…</span>
              </>
            )}
            {pageNumbers.map(p => (
              <Link
                key={p}
                href={`?page=${p}`}
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
                <Link href={`?page=${totalPages}`} className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10">{totalPages}</Link>
              </>
            )}
            {page < totalPages && (
              <Link href={`?page=${page + 1}`} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                Next →
              </Link>
            )}
          </div>
        )}
      </section>
    </PublicLayout>
  )
}
