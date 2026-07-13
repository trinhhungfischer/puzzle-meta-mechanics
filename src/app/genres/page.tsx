import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function GenresPublicPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { games: true } }
    }
  })

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>
          Puzzle Genres
        </h1>
        <p style={{ opacity: 0.8, maxWidth: '600px' }}>
          Browse games by their macro-taxonomy classification.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {genres.map(genre => (
          <Link href={`/genres/${genre.slug}`} key={genre.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="thinky-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-pink)' }}>{genre.name}</h2>
              {genre.description && (
                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {genre.description.length > 100 ? genre.description.substring(0, 100) + '...' : genre.description}
                </p>
              )}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', opacity: 0.7 }}>
                {genre._count.games} Games
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
