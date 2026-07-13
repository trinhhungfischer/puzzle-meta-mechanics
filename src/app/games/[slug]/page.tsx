import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Pill } from '@/components/ui/Pill'
import { BentoBox } from '@/components/ui/BentoBox'

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const game = await prisma.game.findUnique({
    where: { slug: resolvedParams.slug },
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

  return (
    <PublicLayout>
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
        <span>&larr;</span> Back to Games
      </Link>

      <div className="flex flex-col md:flex-row gap-12 mb-20 items-start">
        <div className="w-full md:w-[320px] flex-shrink-0">
          <div className="relative rounded-2xl overflow-hidden glass-panel group">
            {game.coverUrl ? (
              <img 
                src={game.coverUrl} 
                alt={`${game.title} cover`} 
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-brand-cyan/20 to-brand-violet/20">
                <span className="text-8xl opacity-20 font-black uppercase tracking-tighter">{game.title[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 pt-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight drop-shadow-xl text-white">
            {game.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-xl opacity-90 mb-8 font-medium">
            {game.releaseYear && <span className="text-brand-cyan">{game.releaseYear}</span>}
            
            <div className="flex flex-wrap gap-2">
              {game.genres.map(g => (
                <Link key={g.id} href={`/?genre=${g.slug}`} className="no-underline">
                  <Pill color="pink" className="!px-3 !py-1 text-sm">{g.name}</Pill>
                </Link>
              ))}
            </div>
          </div>

          <p className="text-xl leading-relaxed text-zinc-300 mb-8 max-w-prose">
            {game.description || 'No description available.'}
          </p>

          <div className="flex flex-wrap gap-3">
            {game.platforms.map(p => (
              p.storeUrl ? (
                <a key={p.id} href={p.storeUrl} target="_blank" rel="noreferrer" className="no-underline">
                  <Pill color="blue" className="!text-sm !px-4 !py-1.5">
                    {p.platform.name} <span className="ml-1 opacity-50">↗</span>
                  </Pill>
                </a>
              ) : (
                <Pill key={p.id} color="blue" className="!text-sm !px-4 !py-1.5 opacity-80">
                  {p.platform.name}
                </Pill>
              )
            ))}
          </div>
        </div>
      </div>

      <section className="relative">
        {/* Subtle background glow for analysis section */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-violet/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-4xl font-bold tracking-tight mb-12 flex items-center gap-4">
            <span className="w-8 h-1 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet" />
            Mechanic Analysis
          </h2>

          <div className="flex flex-col gap-12">
            {coreMechanics.length > 0 && (
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-400 mb-6">Core Mechanics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreMechanics.map(m => (
                    <MechanicDetailCard key={m.id} data={m} />
                  ))}
                </div>
              </div>
            )}

            {secondaryMechanics.length > 0 && (
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-400 mb-6">Secondary Mechanics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {secondaryMechanics.map(m => (
                    <MechanicDetailCard key={m.id} data={m} />
                  ))}
                </div>
              </div>
            )}

            {twistMechanics.length > 0 && (
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-brand-fuchsia mb-6">Twist / Unique</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {twistMechanics.map(m => (
                    <MechanicDetailCard key={m.id} data={m} />
                  ))}
                </div>
              </div>
            )}

            {game.mechanics.length === 0 && (
              <div className="glass-panel p-12 text-center rounded-2xl">
                <p className="text-zinc-500 text-lg">No mechanics have been analyzed for this game yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

function MechanicDetailCard({ data }: { data: any }) {
  return (
    <BentoBox className="flex flex-col group">
      <Link href={`/mechanics/${data.mechanic.slug}`} className="no-underline inline-block mb-3">
        <h4 className="text-lg font-bold tracking-tight text-white group-hover:text-brand-violet transition-colors">
          {data.mechanic.name}
        </h4>
      </Link>
      {data.note ? (
        <p className="text-sm text-zinc-400 m-0 leading-relaxed">{data.note}</p>
      ) : (
        <p className="text-sm text-zinc-600 m-0 italic">No notes provided.</p>
      )}
    </BentoBox>
  )
}
