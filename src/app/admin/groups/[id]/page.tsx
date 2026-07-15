import prisma from '@/lib/prisma'
import { updateGroup } from '../../actions'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const group = await prisma.mechanicGroup.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!group) {
    notFound()
  }

  return (
    <div>
      <Link href="/admin/groups" style={{ opacity: 0.8, textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Groups
      </Link>

      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Edit Mechanic Group
      </h1>

      <div className="bento-box color-green" style={{ marginBottom: '2rem' }}>
        <form action={async (formData) => {
          'use server'
          await updateGroup(group.id, formData)
        }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" name="name" defaultValue={group.name} placeholder="Group Name (e.g. Object Manipulation)" required style={{ flex: '1 1 200px' }} />
          <input type="text" name="description" defaultValue={group.description || ''} placeholder="Description (optional)" style={{ flex: '2 1 300px' }} />
          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </div>
  )
}
