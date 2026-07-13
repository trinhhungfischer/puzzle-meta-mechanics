import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function GameDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
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

  // Group mechanics by role
  const coreMechanics = game.mechanics.filter(m => m.role === 'core')
  const secondaryMechanics = game.mechanics.filter(m => m.role === 'secondary')
  const twistMechanics = game.mechanics.filter(m => m.role === 'twist')

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/" style={{ opacity: 0.8, textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Games
      </Link>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <div style={{ flex: '0 0 300px' }}>
          {game.coverUrl ? (
            <img src={game.coverUrl} alt={`${game.title} cover`} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <span style={{ fontSize: '5rem', opacity: 0.5 }}>{game.title[0]}</span>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 0.5rem 0', lineHeight: 1.1 }}>{game.title}</h1>
          
          <div style={{ fontSize: '1.2rem', opacity: 0.7, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {game.releaseYear && <span>{game.releaseYear}</span>}
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {game.genres.map(g => (
                <Link key={g.id} href={`/?genre=${g.slug}`} style={{ textDecoration: 'none' }}>
                  <span className="mechanic-pill" style={{ backgroundColor: 'var(--color-pink)', cursor: 'pointer' }}>{g.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '2rem' }}>
            {game.description || 'No description available.'}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {game.platforms.map(p => (
              p.storeUrl ? (
                <a key={p.id} href={p.storeUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <span className="mechanic-pill" style={{ backgroundColor: 'var(--color-blue)', cursor: 'pointer' }}>
                    {p.platform.name} ↗
                  </span>
                </a>
              ) : (
                <span key={p.id} className="mechanic-pill" style={{ backgroundColor: 'var(--color-blue)' }}>
                  {p.platform.name}
                </span>
              )
            ))}
          </div>
        </div>
      </div>

      <section>
        <h2 style={{ fontSize: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '2rem', color: 'var(--color-yellow)' }}>
          Mechanic Analysis
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {coreMechanics.length > 0 && (
            <div>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, marginBottom: '1rem' }}>Core Mechanics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {coreMechanics.map(m => (
                  <MechanicCard key={m.id} data={m} />
                ))}
              </div>
            </div>
          )}

          {secondaryMechanics.length > 0 && (
            <div>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, marginBottom: '1rem' }}>Secondary Mechanics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {secondaryMechanics.map(m => (
                  <MechanicCard key={m.id} data={m} />
                ))}
              </div>
            </div>
          )}

          {twistMechanics.length > 0 && (
            <div>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, marginBottom: '1rem' }}>Twist / Unique Mechanics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {twistMechanics.map(m => (
                  <MechanicCard key={m.id} data={m} />
                ))}
              </div>
            </div>
          )}

          {game.mechanics.length === 0 && (
            <p style={{ opacity: 0.5 }}>No mechanics have been analyzed for this game yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}

function MechanicCard({ data }: { data: any }) {
  return (
    <div className="thinky-card" style={{ padding: '1rem' }}>
      <Link href={`/mechanics/${data.mechanic.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--color-purple)' }}>{data.mechanic.name}</h4>
      </Link>
      {data.note && <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>{data.note}</p>}
    </div>
  )
}
