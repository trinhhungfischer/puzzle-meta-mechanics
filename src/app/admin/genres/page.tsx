import prisma from '@/lib/prisma'
import { createGenre, deleteGenre } from '../actions'

export default async function GenresAdminPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { games: true }
      }
    }
  })

  return (
    <div>
      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Manage Genres
      </h1>

      <div className="bento-box color-pink" style={{ marginBottom: '2rem' }}>
        <div className="bento-header">Add New Genre</div>
        <form action={createGenre} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" name="name" placeholder="Genre Name (e.g. Match-3)" required style={{ flex: '1 1 200px' }} />
          <input type="text" name="description" placeholder="Description (optional)" style={{ flex: '2 1 300px' }} />
          <button type="submit" className="btn">Add Genre</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {genres.map(genre => (
          <div key={genre.id} className="thinky-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="thinky-title" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{genre.name}</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Slug: {genre.slug}</span>
              </div>
              <form action={async () => {
                'use server'
                await deleteGenre(genre.id)
              }}>
                <button type="submit" title="Delete Genre" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '1.2rem' }}>
                  &times;
                </button>
              </form>
            </div>
            {genre.description && <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{genre.description}</p>}
            <div style={{ fontSize: '0.8rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              Used in {genre._count.games} games
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
