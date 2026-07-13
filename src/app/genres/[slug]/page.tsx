import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function GenreDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const genre = await prisma.genre.findUnique({
    where: { slug: params.slug },
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
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/genres" style={{ opacity: 0.8, textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Genres
      </Link>

      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', color: 'var(--color-pink)' }}>{genre.name}</h1>
        {genre.description && (
          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.9 }}>
            {genre.description}
          </p>
        )}
      </header>

      <section>
        <h2 style={{ fontSize: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
          Games in {genre.name}
        </h2>
        
        {genre.games.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No games found in this genre.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {genre.games.map(game => (
              <Link href={`/games/${game.slug}`} key={game.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="thinky-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {game.coverUrl ? (
                    <img src={game.coverUrl} alt={`${game.title} cover`} style={{ height: '180px', objectFit: 'cover', borderRadius: '4px 4px 0 0', margin: '-1rem -1rem 1rem -1rem', width: 'calc(100% + 2rem)' }} />
                  ) : (
                    <div style={{ width: 'calc(100% + 2rem)', height: '180px', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px 4px 0 0', margin: '-1rem -1rem 1rem -1rem' }}>
                      <span style={{ fontSize: '3rem', opacity: 0.5 }}>{game.title[0]}</span>
                    </div>
                  )}
                  
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{game.title}</h3>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {game.mechanics.slice(0, 4).map(m => (
                      <span key={m.id} className="mechanic-pill" style={{ fontSize: '0.7rem' }}>
                        {m.mechanic.name}
                      </span>
                    ))}
                    {game.mechanics.length > 4 && (
                      <span className="mechanic-pill" style={{ fontSize: '0.7rem', backgroundColor: 'var(--border-color)', color: 'var(--bg-color)' }}>
                        +{game.mechanics.length - 4} MORE
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
