import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { GameCard } from '@/components/ui/GameCard'

export default async function GenreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const genre = await prisma.genre.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      games: {
        orderBy: { title: 'asc' },
        include: {
          genres: true,
          mechanics: { include: { mechanic: true } }
        }
      }
    }
  })

  if (!genre) {
    notFound()
  }

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
        <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-outline pb-2 mb-8">
          Games in {genre.name}
        </h2>
        
        {genre.games.length === 0 ? (
          <p className="opacity-70 text-lg">No games found in this genre.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {genre.games.map(game => (
              <GameCard key={game.id} game={game as any} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  )
}
