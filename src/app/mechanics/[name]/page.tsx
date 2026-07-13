import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function MechanicDetailPage(props: { params: Promise<{ name: string }> }) {
  const params = await props.params;
  const decodedParam = decodeURIComponent(params.name);
  const parts = decodedParam.split('-id-');
  const id = parts[parts.length - 1]; // The CUID is at the end
  
  const mechanic = await prisma.mechanic.findUnique({
    where: { id: id },
    include: {
      games: {
        orderBy: { title: 'asc' }
      }
    }
  })

  if (!mechanic) {
    notFound()
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/mechanics" className="btn" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '0.9rem' }}>
          &larr; Back to Mechanics
        </Link>
        <h1 style={{ letterSpacing: '0.05em', fontSize: '2.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {mechanic.name}
        </h1>
      </header>

      <div className="bento-box color-purple" style={{ marginBottom: '2rem' }}>
        <div className="bento-header">Definition & Logic</div>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          {mechanic.description || 'No formal definition provided yet.'}
        </p>
      </div>

      <div className="bento-box color-green">
        <div className="bento-header">Games Utilizing This Mechanic ({mechanic.games.length})</div>
        {mechanic.games.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {mechanic.games.map(game => (
              <li key={game.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <strong>{game.title}</strong>
                {game.releaseYear && <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>({game.releaseYear})</span>}
                {game.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{game.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>
            There are currently no games recorded in the database that use this mechanic.
          </p>
        )}
      </div>
    </main>
  )
}
