import prisma from '@/lib/prisma'
import { updatePlatform } from '../../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditPlatformPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const platform = await prisma.platform.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!platform) {
    notFound()
  }

  return (
    <div>
      <Link href="/admin/platforms" style={{ opacity: 0.8, textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Platforms
      </Link>

      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Edit Platform
      </h1>

      <div className="bento-box color-blue" style={{ marginBottom: '2rem' }}>
        <form action={async (formData) => {
          'use server'
          await updatePlatform(platform.id, formData)
        }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" name="name" defaultValue={platform.name} placeholder="Platform Name (e.g. PC/Steam)" required style={{ flex: '1 1 200px' }} />
          <button type="submit" className="btn">Save Changes</button>
        </form>
      </div>
    </div>
  )
}
