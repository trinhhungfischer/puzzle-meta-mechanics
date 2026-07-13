import Link from 'next/link'
import prisma from '@/lib/prisma'
import Brainstorm from '@/components/Brainstorm'

export default async function Home() {
  const gamesCount = await prisma.game.count()
  const mechanicsCount = await prisma.mechanic.count()
  
  const mechanics = await prisma.mechanic.findMany({ orderBy: { name: 'asc' }})
  const rawGames = await prisma.game.findMany({ include: { mechanics: true }})

  const games = rawGames.map(g => ({
    id: g.id,
    title: g.title,
    mechanicIds: g.mechanics.map(m => m.id)
  }))

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2.5rem' }}>
          Puzzle Meta Mechanics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          A database for puzzle games and their meta mechanics.
        </p>
      </header>

      <div className="bento-grid">
        <div className="bento-box color-blue">
          <div className="bento-header">Database Overview</div>
          <p>Games: <strong>{gamesCount}</strong></p>
          <p>Mechanics: <strong>{mechanicsCount}</strong></p>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <Brainstorm mechanics={mechanics} games={games} />
        </div>

        <div className="bento-box color-purple">
          <div className="bento-header">Manage Mechanics</div>
          <p style={{ marginBottom: '1rem' }}>Create, update, or delete puzzle mechanics.</p>
          <Link href="/mechanics" className="btn">View Mechanics</Link>
        </div>

        <div className="bento-box color-green">
          <div className="bento-header">Manage Games</div>
          <p style={{ marginBottom: '1rem' }}>Add new puzzle games and assign mechanics to them.</p>
          <Link href="/games" className="btn">View Games</Link>
        </div>
      </div>
    </main>
  )
}
