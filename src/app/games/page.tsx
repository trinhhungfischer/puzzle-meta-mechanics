import prisma from '@/lib/prisma'
import { createGame, deleteGame } from '../actions'
import MechanicSelector from '@/components/MechanicSelector'

export default async function GamesPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      mechanics: true
    }
  })

  const allMechanics = await prisma.mechanic.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem' }}>
          Manage Games
        </h1>
      </header>

      <div className="bento-grid">
        {/* Create Form */}
        <div className="bento-box color-yellow" style={{ gridColumn: '1 / -1' }}>
          <div className="bento-header">Add New Puzzle Game</div>
          <form action={createGame} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 300px' }}>
                <input type="text" name="title" placeholder="Game Title (e.g. Braid)" required style={{ marginBottom: 0 }} />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <input type="number" name="releaseYear" placeholder="Year" style={{ marginBottom: 0 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 100%' }}>
                <input type="text" name="coverUrl" placeholder="Cover Image URL (e.g. https://.../image.jpg)" style={{ marginBottom: 0 }} />
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <input type="text" name="description" placeholder="Short description..." style={{ marginBottom: 0 }} />
              </div>
            </div>
            <MechanicSelector mechanics={allMechanics} />

            <div style={{ marginTop: '0.5rem' }}>
              <button type="submit" className="btn">Create Game</button>
            </div>
          </form>
        </div>

        {/* List of Games */}
        <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <h2 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Game Directory
          </h2>
        </div>
        
        {games.map(game => (
          <div key={game.id} className="thinky-card">
            {game.coverUrl ? (
              <img src={game.coverUrl} alt={`${game.title} cover`} className="thinky-cover" />
            ) : (
              <div className="thinky-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.5rem', opacity: 0.5 }}>{game.title[0]}</span>
              </div>
            )}
            
            <div className="thinky-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="thinky-title">{game.title}</h3>
                  <div className="thinky-meta">
                    {game.releaseYear ? `Released ${game.releaseYear}` : 'Unknown Year'}
                  </div>
                </div>
                <form action={async () => {
                  'use server'
                  await deleteGame(game.id)
                }}>
                  <button type="submit" title="Delete Game" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '1.2rem', padding: '0 0.5rem' }}>
                    &times;
                  </button>
                </form>
              </div>
              
              <p className="thinky-desc">
                {game.description || 'No description provided.'}
              </p>
              
              <div className="thinky-tags">
                {game.mechanics.slice(0, 5).map(m => (
                  <span key={m.id} className="mechanic-pill">
                    {m.name.replace(/\[.*?\]\s*/, '')} {/* Strip the code for cleaner UI */}
                  </span>
                ))}
                {game.mechanics.length > 5 && (
                  <span className="mechanic-pill" style={{ backgroundColor: 'var(--border-color)', color: 'var(--bg-color)' }}>
                    +{game.mechanics.length - 5} MORE
                  </span>
                )}
                {game.mechanics.length === 0 && (
                  <span className="mechanic-pill" style={{ opacity: 0.5 }}>No mechanics</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
