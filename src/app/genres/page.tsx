import prisma from '@/lib/prisma'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { BentoBox } from '@/components/ui/BentoBox'

export default async function GenresPublicPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { games: true } }
    }
  })

  return (
    <PublicLayout>
      <div className="relative mb-8 rounded-2xl overflow-hidden glass-panel p-6 flex flex-col sm:flex-row items-center justify-between border-white/5 gap-6">
        <div className="absolute inset-0 bg-zinc-950/80 z-0" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-brand-accent/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 items-center justify-center">
            <span className="text-xl text-brand-accent font-black">G</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              Puzzle <span className="accent-text">Genres</span>
            </h1>
            <p className="text-sm text-zinc-400 m-0">
              Browse games by their macro-taxonomy classification.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold">
            {genres.length} Categories
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {genres.map(genre => (
          <Link href={`/genres/${genre.slug}`} key={genre.id} className="no-underline text-inherit group">
            <BentoBox className="!p-6 h-full flex flex-col group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/30 transition-all">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-pink-solid group-hover:underline">
                {genre.name}
              </h2>
              {genre.description && (
                <p className="opacity-80 text-sm mb-4 line-clamp-3">
                  {genre.description}
                </p>
              )}
              <div className="mt-auto pt-4 border-t-2 border-outline text-xs opacity-70 font-bold uppercase tracking-widest">
                {genre._count.games} Games
              </div>
            </BentoBox>
          </Link>
        ))}
      </div>
    </PublicLayout>
  )
}
