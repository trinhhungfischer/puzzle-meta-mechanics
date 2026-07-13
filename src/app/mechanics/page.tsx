import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function MechanicsPublicPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q

  const groups = await prisma.mechanicGroup.findMany({
    orderBy: { name: 'asc' },
    include: {
      mechanics: {
        where: q ? { name: { contains: q } } : undefined,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { games: true } }
        }
      }
    }
  })

  // Filter out groups that have no mechanics matching the search
  const visibleGroups = groups.filter(g => g.mechanics.length > 0)

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>
            Mechanics Encyclopedia
          </h1>
          <p style={{ opacity: 0.8, maxWidth: '600px' }}>
            The atomic building blocks of puzzle games, organized by their systemic function.
          </p>
        </div>
        <Link href="/" className="btn" style={{ textDecoration: 'none' }}>Back to Games</Link>
      </header>

      <form style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', maxWidth: '600px' }}>
        <input 
          type="text" 
          name="q" 
          defaultValue={q} 
          placeholder="Search mechanics by name..." 
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn">Search</button>
      </form>

      {visibleGroups.map(group => (
        <section key={group.id} style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-purple)' }}>
            {group.name}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {group.mechanics.map(mechanic => (
              <Link href={`/mechanics/${mechanic.slug}`} key={mechanic.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="thinky-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-purple)' }}>{mechanic.name}</h3>
                  <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {mechanic.description ? 
                      (mechanic.description.length > 100 ? mechanic.description.substring(0, 100) + '...' : mechanic.description) 
                      : 'No definition provided.'}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', opacity: 0.7 }}>
                    Used in {mechanic._count.games} games
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {visibleGroups.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
          No mechanics found matching "{q}".
        </div>
      )}
    </main>
  )
}
