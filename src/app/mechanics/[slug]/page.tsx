import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { BentoBox } from '@/components/ui/BentoBox'
import { Pill } from '@/components/ui/Pill'
import { getCoOccurringMechanics } from '@/lib/relations'

export default async function MechanicDetailPage({
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

  const mechanic = await prisma.mechanic.findUnique({
    where: { slug: resolvedParams.slug },
    include: { group: true }
  })

  if (!mechanic) {
    notFound()
  }

  const [totalGames, gamesUsing] = await Promise.all([
    prisma.gameMechanic.count({ 
      where: { mechanicId: mechanic.id, game: { status: 'published' } } 
    }),
    prisma.gameMechanic.findMany({
      where: { mechanicId: mechanic.id, game: { status: 'published' } },
      include: { game: true },
      orderBy: { game: { title: 'asc' } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    })
  ])

  const totalPages = Math.max(1, Math.ceil(totalGames / PAGE_SIZE))
  const pageNumbers: number[] = []
  const from = Math.max(1, page - 2)
  const to = Math.min(totalPages, from + 4)
  for (let p = Math.max(1, to - 4); p <= to; p++) pageNumbers.push(p)

  const mediaUrls = mechanic.mediaUrls ? JSON.parse(mechanic.mediaUrls) : []
  const constraints = mechanic.constraints ? JSON.parse(mechanic.constraints) : []

  const coOccurring = await getCoOccurringMechanics(mechanic.id)

  return (
    <PublicLayout>
      <Link href="/mechanics" className="inline-block opacity-80 mb-8 hover:underline">
        &larr; Back to Mechanics
      </Link>

      <header className="mb-12">
        <div className="uppercase tracking-widest font-bold text-brand-violet mb-2">
          {mechanic.group.name}
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-white">
          {mechanic.name}
        </h1>
        {mechanic.description && (
          <p className="text-xl leading-relaxed opacity-90 max-w-prose text-zinc-300">
            {mechanic.description}
          </p>
        )}
      </header>

      {/* Frequently Paired With (US-011) */}
      {coOccurring.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">
            Frequently Paired With
          </h2>
          <p className="text-zinc-400 text-sm mb-6">Mechanics that co-occur in the same games.</p>
          <div className="flex flex-wrap gap-3">
            {coOccurring.map(({ mechanic: m, shared }) => (
              <Link key={m.id} href={`/mechanics/${m.slug}`} className="no-underline">
                <Pill color="purple" className="!px-3 !py-1.5 !text-sm flex items-center gap-2">
                  {m.name}
                  <span className="opacity-60">×{shared}</span>
                </Pill>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Constraints & Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {constraints.length > 0 && (
          <BentoBox color="pink" header="Operating Constraints">
            <ul className="list-disc list-inside space-y-2 text-zinc-300">
              {constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </BentoBox>
        )}

        {mediaUrls.length > 0 && (
          <BentoBox color="blue" header="Media Embeds">
            <div className="flex flex-col gap-4">
              {mediaUrls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline break-all">
                  {url}
                </a>
              ))}
            </div>
          </BentoBox>
        )}
      </div>

      {/* Games Using This Mechanic */}
      <section>
        <div className="flex justify-between items-end border-b-4 border-outline pb-2 mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">
            Games using {mechanic.name}
          </h2>
          <span className="text-zinc-400 font-medium">
            {totalGames} game{totalGames !== 1 && 's'}
          </span>
        </div>
        
        {gamesUsing.length === 0 ? (
          <p className="opacity-70 text-lg">No games are currently documented to use this mechanic.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gamesUsing.map(gm => (
              <BentoBox key={gm.id} className="!p-4 h-full flex flex-col bg-zinc-900/50">
                <Link href={`/games/${gm.game.slug}`} className="no-underline hover:underline">
                  <h3 className="text-xl font-bold uppercase tracking-tight text-brand-cyan mb-2">
                    {gm.game.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <Pill color="purple">{gm.role}</Pill>
                </div>
                {gm.note && <p className="text-sm text-zinc-400 m-0">{gm.note}</p>}
              </BentoBox>
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
