import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { BentoBox } from '@/components/ui/BentoBox'
import { Pill } from '@/components/ui/Pill'
import { getCoOccurringMechanics } from '@/lib/relations'

export default async function MechanicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const mechanic = await prisma.mechanic.findUnique({
    where: { slug: resolvedParams.slug },
    relationLoadStrategy: 'join',
    include: {
      group: true,
      games: {
        where: { game: { status: 'published' } },
        include: {
          game: true
        },
        orderBy: { game: { title: 'asc' } }
      }
    }
  })

  if (!mechanic) {
    notFound()
  }

  const mediaUrls = mechanic.mediaUrls ? JSON.parse(mechanic.mediaUrls) : []
  const constraints = mechanic.constraints ? JSON.parse(mechanic.constraints) : []

  const coOccurring = await getCoOccurringMechanics(mechanic.id)

  return (
    <PublicLayout>
      <Link href="/mechanics" className="inline-block opacity-80 mb-8 hover:underline">
        &larr; Back to Mechanics
      </Link>

      <header className="mb-12">
        <div className="uppercase tracking-widest font-bold text-purple-solid mb-2">
          {mechanic.group.name}
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
          {mechanic.name}
        </h1>
        {mechanic.description && (
          <p className="text-xl leading-relaxed opacity-90 max-w-prose">
            {mechanic.description}
          </p>
        )}
      </header>

      {/* Frequently Paired With (US-011) */}
      {coOccurring.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
            Frequently Paired With
          </h2>
          <p className="opacity-60 text-sm mb-6">Mechanics that co-occur in the same games.</p>
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
            <ul className="list-disc list-inside space-y-2 opacity-90">
              {constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </BentoBox>
        )}

        {mediaUrls.length > 0 && (
          <BentoBox color="blue" header="Media Embeds">
            <div className="flex flex-col gap-4">
              {mediaUrls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="text-blue-solid hover:underline break-all">
                  {url}
                </a>
              ))}
            </div>
          </BentoBox>
        )}
      </div>

      {/* Games Using This Mechanic */}
      <section>
        <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-outline pb-2 mb-8">
          Games using {mechanic.name}
        </h2>
        
        {mechanic.games.length === 0 ? (
          <p className="opacity-70 text-lg">No games are currently documented to use this mechanic.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mechanic.games.map(gm => (
              <BentoBox key={gm.id} className="!p-4 h-full flex flex-col">
                <Link href={`/games/${gm.game.slug}`} className="no-underline hover:underline">
                  <h3 className="text-xl font-black uppercase tracking-tight text-yellow-solid mb-2">
                    {gm.game.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <Pill color="purple">{gm.role}</Pill>
                </div>
                {gm.note && <p className="text-sm opacity-80 m-0">{gm.note}</p>}
              </BentoBox>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  )
}
