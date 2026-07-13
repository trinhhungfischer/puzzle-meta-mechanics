import prisma from '@/lib/prisma'
import { createGroup, deleteGroup } from '../actions'

export default async function GroupsAdminPage() {
  const groups = await prisma.mechanicGroup.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { mechanics: true }
      }
    }
  })

  return (
    <div>
      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Manage Mechanic Groups
      </h1>

      <div className="bento-box color-green" style={{ marginBottom: '2rem' }}>
        <div className="bento-header">Add New Group</div>
        <form action={createGroup} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" name="name" placeholder="Group Name (e.g. Object Manipulation)" required style={{ flex: '1 1 200px' }} />
          <input type="text" name="description" placeholder="Description (optional)" style={{ flex: '2 1 300px' }} />
          <button type="submit" className="btn">Add Group</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {groups.map(group => (
          <div key={group.id} className="thinky-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="thinky-title" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{group.name}</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Slug: {group.slug}</span>
              </div>
              <form action={async () => {
                'use server'
                await deleteGroup(group.id)
              }}>
                <button type="submit" title="Delete Group" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '1.2rem' }}>
                  &times;
                </button>
              </form>
            </div>
            {group.description && <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{group.description}</p>}
            <div style={{ fontSize: '0.8rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              Contains {group._count.mechanics} mechanics
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
