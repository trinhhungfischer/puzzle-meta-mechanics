import prisma from '@/lib/prisma'
import Link from 'next/link'
import { deleteGame } from '../actions'

export default async function GamesAdminPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      genres: true,
      platforms: { include: { platform: true } },
      mechanics: { include: { mechanic: true } }
    }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', margin: 0 }}>
          Manage Games
        </h1>
        <Link href="/admin/games/new" className="btn" style={{ textDecoration: 'none' }}>
          + Add New Game
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {games.map(game => (
          <div key={game.id} className="thinky-card" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
            {game.coverUrl ? (
              <img src={game.coverUrl} alt={`${game.title} cover`} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <span style={{ fontSize: '2rem', opacity: 0.5 }}>{game.title[0]}</span>
              </div>
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>{game.title}</h2>
                <form action={async () => {
                  'use server'
                  await deleteGame(game.id)
                }}>
                  <button type="submit" title="Delete Game" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '1.2rem' }}>
                    &times;
                  </button>
                </form>
              </div>
              <p style={{ opacity: 0.8, marginBottom: '0.5rem' }}>{game.description}</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {game.genres.map(g => (
                  <span key={g.id} className="mechanic-pill" style={{ backgroundColor: 'var(--color-pink)' }}>{g.name}</span>
                ))}
                {game.platforms.map(p => (
                  <span key={p.id} className="mechanic-pill" style={{ backgroundColor: 'var(--color-blue)' }}>{p.platform.name}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {game.mechanics.map(m => (
                  <span key={m.id} className="mechanic-pill">
                    {m.mechanic.name} <span style={{ opacity: 0.7, fontSize: '0.8em' }}>({m.role})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {games.length === 0 && <p>No games found.</p>}
      </div>
    </div>
  )
}
