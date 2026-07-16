import prisma from '@/lib/prisma'
export const revalidate = 3600;
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Pill } from '@/components/ui/Pill'
import { BentoBox } from '@/components/ui/BentoBox'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { GameCard } from '@/components/ui/GameCard'
import { getRelatedGames } from '@/lib/relations'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const game = await prisma.game.findFirst({
    where: { slug: resolvedParams.slug, status: 'published' },
    select: { title: true, description: true, coverUrl: true }
  })
  if (!game) return {}
  return {
    title: `${game.title} | Puzzle Meta-Mechanic`,
    description: game.description || `Details and mechanics for ${game.title}`,
    openGraph: {
      title: game.title,
      description: game.description || `Details and mechanics for ${game.title}`,
      images: game.coverUrl ? [game.coverUrl] : [],
    }
  }
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const game = await prisma.game.findFirst({
    where: { slug: resolvedParams.slug, status: 'published' },
    relationLoadStrategy: 'join',
    include: {
      genres: true,
      platforms: {
        include: { platform: true }
      },
      mechanics: {
        include: { mechanic: true },
        orderBy: { mechanic: { name: 'asc' } }
      }
    }
  })

  if (!game) {
    notFound()
  }

  const coreMechanics = game.mechanics.filter(m => m.role === 'core')
  const secondaryMechanics = game.mechanics.filter(m => m.role === 'secondary')
  const twistMechanics = game.mechanics.filter(m => m.role === 'twist')

  const relatedGames = await getRelatedGames(
    game.id,
    game.mechanics.map(m => m.mechanicId),
  )

  return (
    <PublicLayout>
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-brand-accent mb-8 transition-colors no-underline">
        <span className="text-xl">&larr;</span> Back to Grid
      </Link>

      <div className="flex flex-col md:flex-row gap-16 mb-32 items-start">
        <div className="w-full md:w-[400px] flex-shrink-0">
          <div className="relative rounded-[2rem] overflow-hidden glass-panel group shadow-2xl">
            {game.coverUrl ? (
              <img 
                src={game.coverUrl} 
                alt={`${game.title} cover`} 
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
              />
            ) : (
              <div className="w-full aspect-[3/4] flex items-center justify-center bg-zinc-900 border border-white/5">
                <span className="text-9xl opacity-10 font-black uppercase tracking-tighter text-brand-accent">{game.title[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none rounded-[2rem]" />
          </div>
        </div>

        <div className="flex-1 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold uppercase tracking-widest mb-6">
            {game.releaseYear || 'TBA'}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight drop-shadow-xl text-white max-w-3xl">
            {game.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-mono mb-10 pb-10 border-b border-white/10">
            {game.ratingScore !== null && game.ratingScore !== undefined && (
              <span className="flex items-center gap-1 text-zinc-100 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-yellow-500">★</span> {game.ratingScore}
              </span>
            )}
            {game.isFree ? (
              <span className="text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-lg font-bold">FREE</span>
            ) : game.price !== null && game.price !== undefined ? (
              <span className="text-zinc-300 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg">${game.price.toFixed(2)}</span>
            ) : null}
            {game.downloads !== null && game.downloads !== undefined && (
              <span className="text-zinc-300 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg">
                <span className="text-brand-accent">↓</span> {game.downloads >= 1000000 
                  ? `${(game.downloads / 1000000).toFixed(1)}M` 
                  : game.downloads >= 1000 
                    ? `${Math.floor(game.downloads / 1000)}k` 
                    : game.downloads} DLs
              </span>
            )}
            
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            
            <div className="flex flex-wrap gap-2">
              {game.genres.map(g => (
                <Link key={g.id} href={`/?genre=${g.slug}`} className="no-underline">
                  <Pill color="accent" className="!px-3 !py-1.5 text-xs">{g.name}</Pill>
                </Link>
              ))}
            </div>
          </div>

          <p className="text-xl leading-relaxed text-zinc-400 mb-12 max-w-[65ch]">
            {game.description || 'Systemic decomposition data is currently being populated for this title.'}
          </p>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Distribution Vectors</h3>
            <div className="flex flex-wrap gap-3">
              {game.platforms.map((p: any) => (
                <div key={p.id} className="flex flex-col items-start gap-1">
                  {p.storeUrl ? (
                    <a href={p.storeUrl} target="_blank" rel="noreferrer" className="no-underline">
                      <Pill color="default" className="!text-sm !px-4 !py-2 flex items-center gap-2 group border-white/10 bg-zinc-900">
                        <PlatformIcon name={p.platform.name} className="w-4 h-4 text-zinc-400 group-hover:text-brand-accent transition-colors" />
                        <span className="text-zinc-300 group-hover:text-white transition-colors">{p.platform.name}</span>
                        <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 text-brand-accent">↗</span>
                      </Pill>
                    </a>
                  ) : (
                    <Pill color="default" className="!text-sm !px-4 !py-2 opacity-80 flex items-center gap-2 cursor-default border-white/5 bg-zinc-900/50">
                      <PlatformIcon name={p.platform.name} className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400">{p.platform.name}</span>
                    </Pill>
                  )}
                  {/* Per-platform metrics if any */}
                  {(p.ratingScore !== null || p.downloads !== null || p.price !== null) && (
                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 pl-2 mt-1">
                      {p.ratingScore !== null && <span className="text-yellow-500/70">★{p.ratingScore}</span>}
                      {p.downloads !== null && <span>{p.downloads >= 1000000 ? `${(p.downloads / 1000000).toFixed(1)}M` : p.downloads >= 1000 ? `${Math.floor(p.downloads / 1000)}k` : p.downloads}</span>}
                      {p.isFree ? <span className="text-brand-accent/70">FREE</span> : p.price !== null ? <span>${p.price.toFixed(2)}</span> : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="relative mb-32">
        {/* Subtle background glow for analysis section */}
        <div className="absolute top-1/2 left-1/4 w-[800px] h-[400px] bg-brand-accent/5 rounded-[100%] blur-[120px] pointer-events-none -translate-y-1/2" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight mb-12 flex items-center gap-4 text-white">
            <span className="w-1.5 h-8 rounded-full bg-brand-accent" />
            Systemic Analysis
          </h2>

          <div className="flex flex-col gap-16">
            {coreMechanics.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-3">
                  <span className="w-8 h-px bg-white/10" />
                  Core Architecture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreMechanics.map(m => (
                    <MechanicDetailCard key={m.id} data={m} color="accent" />
                  ))}
                </div>
              </div>
            )}

            {secondaryMechanics.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-3">
                  <span className="w-8 h-px bg-white/10" />
                  Secondary Systems
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {secondaryMechanics.map(m => (
                    <MechanicDetailCard key={m.id} data={m} />
                  ))}
                </div>
              </div>
            )}

            {twistMechanics.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent mb-6 flex items-center gap-3">
                  <span className="w-8 h-px bg-brand-accent/30" />
                  Unique Vectors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {twistMechanics.map(m => (
                    <MechanicDetailCard key={m.id} data={m} color="accent" />
                  ))}
                </div>
              </div>
            )}

            {game.mechanics.length === 0 && (
              <div className="glass-panel p-16 text-center rounded-[2rem] border-white/5 border-dashed">
                <p className="text-zinc-500 text-lg">Decomposition pending for this title.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {relatedGames.length > 0 && (
        <section className="mt-20 border-t border-white/10 pt-20">
          <h2 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-4 text-white">
            <span className="w-1.5 h-8 rounded-full bg-zinc-700" />
            Topological Siblings
          </h2>
          <p className="text-zinc-500 -mt-4 mb-12 text-sm max-w-prose">Identified via shared mechanical nodes in the systemic graph.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedGames.map(({ game: rg, shared }) => (
              <div key={rg.id} className="relative">
                <div className="absolute top-4 right-4 z-20">
                  <Pill color="accent" className="!text-[0.6rem] !bg-brand-accent !text-zinc-950 font-bold border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {shared} Nodes
                  </Pill>
                </div>
                <GameCard game={rg} />
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  )
}

function MechanicDetailCard({ data, color = 'default' }: { data: any, color?: 'default'|'accent' }) {
  return (
    <BentoBox className="flex flex-col group h-full" color={color}>
      <Link href={`/mechanics/${data.mechanic.slug}`} className="no-underline inline-block mb-4">
        <h4 className="text-xl font-bold tracking-tight text-white group-hover:text-brand-accent transition-colors flex items-center gap-2">
          {data.mechanic.name}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-accent -translate-x-2 group-hover:translate-x-0 duration-300">→</span>
        </h4>
      </Link>
      {data.note ? (
        <p className="text-sm text-zinc-400 m-0 leading-relaxed font-medium">{data.note}</p>
      ) : (
        <p className="text-sm text-zinc-600 m-0 font-mono">_no_context_provided_</p>
      )}
    </BentoBox>
  )
}
