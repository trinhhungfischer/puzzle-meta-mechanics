import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { createPlatform, deletePlatform } from '../actions'
import Link from 'next/link'

export default async function PlatformsAdminPage() {
  const platforms = await prisma.platform.findMany({
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
        Manage Platforms
      </h1>

      <div className="bento-box color-blue" style={{ marginBottom: '2rem' }}>
        <div className="bento-header">Add New Platform</div>
        <form action={createPlatform} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" name="name" placeholder="Platform Name (e.g. PC/Steam)" required style={{ flex: '1 1 200px' }} />
          <Button type="submit">Add Platform</Button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {platforms.map(platform => (
          <div key={platform.id} className="thinky-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="thinky-title" style={{ fontSize: '1.2rem', margin: 0 }}>{platform.name}</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Slug: {platform.slug}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href={`/admin/platforms/${platform.id}`} style={{ textDecoration: 'none', color: 'var(--color-blue)', fontSize: '0.9rem', padding: '0.2rem' }}>
                  Edit
                </Link>
                <form action={async () => {
                  'use server'
                  await deletePlatform(platform.id)
                }}>
                  <Button type="submit" variant="ghost" title="Delete Platform" className="text-red-500 hover:text-red-400 p-2 text-xl hover:bg-red-500/10">
                    &times;
                  </Button>
                </form>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              Used in {platform._count.games} games
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
