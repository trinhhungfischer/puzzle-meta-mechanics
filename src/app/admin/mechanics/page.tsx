import prisma from '@/lib/prisma'
import { createMechanic, deleteMechanic } from '../actions'
import Link from 'next/link'

export default async function MechanicsAdminPage() {
  const mechanics = await prisma.mechanic.findMany({
    orderBy: { name: 'asc' },
    include: {
      group: true,
      _count: {
        select: { games: true }
      }
    }
  })

  const groups = await prisma.mechanicGroup.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div>
      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Manage Mechanics
      </h1>

      <div className="bento-box color-purple" style={{ marginBottom: '2rem' }}>
        <div className="bento-header">Add New Mechanic</div>
        <form action={createMechanic} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input type="text" name="name" placeholder="Mechanic Name (e.g. Push)" required style={{ flex: '1 1 200px' }} />
            <select name="groupId" required style={{ flex: '1 1 200px' }} defaultValue="">
              <option value="" disabled>Select Group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <input type="text" name="description" placeholder="Description (optional)" />
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Constraints (One per line)</label>
              <textarea name="constraints" rows={3} placeholder="- Can only push one object at a time" style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Media URLs (One per line)</label>
              <textarea name="mediaUrls" rows={3} placeholder="https://youtube.com/..." style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
          
          <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Add Mechanic</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {mechanics.map(mechanic => (
          <div key={mechanic.id} className="thinky-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="thinky-title" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{mechanic.name}</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Group: {mechanic.group.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href={`/admin/mechanics/${mechanic.id}`} style={{ textDecoration: 'none', color: 'var(--color-blue)', fontSize: '0.9rem', padding: '0.2rem' }}>
                  Edit
                </Link>
                <form action={async () => {
                  'use server'
                  await deleteMechanic(mechanic.id)
                }}>
                  <button type="submit" title="Delete Mechanic" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '1.2rem' }}>
                    &times;
                  </button>
                </form>
              </div>
            </div>
            {mechanic.description && <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{mechanic.description}</p>}
            <div style={{ fontSize: '0.8rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              Used in {mechanic._count.games} games
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
