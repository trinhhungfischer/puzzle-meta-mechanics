import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function MechanicDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const mechanic = await prisma.mechanic.findUnique({
    where: { slug: params.slug },
    include: {
      group: true,
      games: {
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

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/mechanics" style={{ opacity: 0.8, textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Mechanics
      </Link>

      <header style={{ marginBottom: '3rem' }}>
        <div style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1rem', color: 'var(--color-purple)', marginBottom: '0.5rem' }}>
          {mechanic.group.name}
        </div>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>{mechanic.name}</h1>
        {mechanic.description && (
          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.9 }}>
            {mechanic.description}
          </p>
        )}
      </header>

      {/* Constraints & Media */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        {constraints.length > 0 && (
          <div className="bento-box color-pink">
            <div className="bento-header">Operating Constraints</div>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {constraints.map((c: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{c}</li>)}
            </ul>
          </div>
        )}

        {mediaUrls.length > 0 && (
          <div className="bento-box color-blue">
            <div className="bento-header">Media Embeds</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mediaUrls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Games Using This Mechanic */}
      <section>
        <h2 style={{ fontSize: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          Games using {mechanic.name}
        </h2>
        
        {mechanic.games.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No games are currently documented to use this mechanic.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {mechanic.games.map(gm => (
              <div key={gm.id} className="thinky-card" style={{ padding: '1rem' }}>
                <Link href={\`/games/\${gm.game.slug}\`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-yellow)' }}>{gm.game.title}</h3>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="mechanic-pill" style={{ backgroundColor: 'var(--color-purple)' }}>{gm.role}</span>
                </div>
                {gm.note && <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>{gm.note}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
