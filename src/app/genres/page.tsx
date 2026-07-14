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
      <div className="relative mb-16 rounded-3xl overflow-hidden glass-panel p-12 text-center flex flex-col items-center justify-center border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-fuchsia/10 via-zinc-950 to-brand-cyan/10 z-0" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-cyan/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Puzzle <br/> <span className="gradient-text">Genres</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-0 leading-relaxed font-medium">
            Browse games by their macro-taxonomy classification.
          </p>
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
