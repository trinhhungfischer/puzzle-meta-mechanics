import prisma from '@/lib/prisma'
import { createMechanic, deleteMechanic } from '../actions'
import Link from 'next/link'

export default async function MechanicsPage() {
  const mechanics = await prisma.mechanic.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { games: true }
      }
    }
  })

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem' }}>
          Manage Mechanics
        </h1>
      </header>

      <div className="bento-grid">
        {/* Create Form */}
        <div className="bento-box color-blue" style={{ gridColumn: '1 / -1' }}>
          <div className="bento-header">Add New Mechanic</div>
          <form action={createMechanic} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <input type="text" name="name" placeholder="Mechanic Name (e.g. Time Travel)" required />
            </div>
            <div style={{ flex: '2 1 300px' }}>
              <input type="text" name="description" placeholder="Short description..." />
            </div>
            <div>
              <button type="submit" className="btn">Create</button>
            </div>
          </form>
        </div>

        {/* List of Mechanics */}
        {mechanics.map(mechanic => {
          const slug = mechanic.name.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
          return (
          <div key={mechanic.id} className="bento-box color-purple">
            <div className="bento-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href={`/mechanics/${slug}-id-${mechanic.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{ cursor: 'pointer' }}>{mechanic.name}</span>
              </Link>
              <form action={async () => {
                'use server'
                await deleteMechanic(mechanic.id)
              }}>
                <button type="submit" className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderColor: 'red', color: 'red' }}>
                  Del
                </button>
              </form>
            </div>
            <p style={{ color: 'var(--text-secondary)', minHeight: '3rem' }}>
              {mechanic.description || 'No description provided.'}
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              <strong>Used in:</strong> {mechanic._count.games} game(s)
            </div>
          </div>
          )
        })}
      </div>
    </main>
  )
}
