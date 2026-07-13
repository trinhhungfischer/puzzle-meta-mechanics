import prisma from '@/lib/prisma'
import { updateMechanic } from '../../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditMechanicPage({
  params,
}: {
  params: { id: string }
}) {
  const mechanic = await prisma.mechanic.findUnique({
    where: { id: params.id }
  })

  if (!mechanic) {
    notFound()
  }

  const groups = await prisma.mechanicGroup.findMany({
    orderBy: { name: 'asc' }
  })

  const constraintsStr = mechanic.constraints ? (JSON.parse(mechanic.constraints) as string[]).join('\n') : ''
  const mediaUrlsStr = mechanic.mediaUrls ? (JSON.parse(mechanic.mediaUrls) as string[]).join('\n') : ''

  return (
    <div>
      <Link href="/admin/mechanics" style={{ opacity: 0.8, textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Mechanics
      </Link>

      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Edit Mechanic
      </h1>

      <div className="bento-box color-purple" style={{ marginBottom: '2rem' }}>
        <form action={async (formData) => {
          'use server'
          await updateMechanic(mechanic.id, formData)
        }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input type="text" name="name" defaultValue={mechanic.name} placeholder="Mechanic Name (e.g. Push)" required style={{ flex: '1 1 200px' }} />
            <select name="groupId" required style={{ flex: '1 1 200px' }} defaultValue={mechanic.groupId}>
              <option value="" disabled>Select Group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          
          <input type="text" name="description" defaultValue={mechanic.description || ''} placeholder="Description (optional)" />
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Constraints (One per line)</label>
              <textarea name="constraints" defaultValue={constraintsStr} rows={5} placeholder="- Can only push one object at a time" style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Media URLs (One per line)</label>
              <textarea name="mediaUrls" defaultValue={mediaUrlsStr} rows={5} placeholder="https://youtube.com/..." style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
          
          <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
        </form>
      </div>
    </div>
  )
}
