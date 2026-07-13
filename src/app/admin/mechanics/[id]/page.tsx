import prisma from '@/lib/prisma'
import { updateMechanic } from '../../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BentoBox } from '@/components/ui/BentoBox'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'

export default async function EditMechanicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const mechanic = await prisma.mechanic.findUnique({
    where: { id: resolvedParams.id }
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
      <Link href="/admin/mechanics" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
        <span>&larr;</span> Back to Mechanics
      </Link>

      <h1 className="text-3xl font-black uppercase tracking-widest mb-8">
        Edit Mechanic
      </h1>

      <BentoBox color="purple" header="Mechanic Details" className="mb-12">
        <form action={async (formData) => {
          'use server'
          await updateMechanic(mechanic.id, formData)
        }} className="flex flex-col gap-4">
          
          <div className="flex flex-wrap gap-4">
            <input type="text" name="name" defaultValue={mechanic.name} placeholder="Mechanic Name (e.g. Push)" required className="flex-1 min-w-[200px]" />
            <div className="flex-1 min-w-[200px]">
              <Dropdown 
                name="groupId" 
                defaultValue={mechanic.groupId}
                required 
                placeholder="Select Group" 
                options={groups.map(g => ({ label: g.name, value: g.id }))} 
              />
            </div>
          </div>
          
          <input type="text" name="description" defaultValue={mechanic.description || ''} placeholder="Description (optional)" className="w-full" />
          
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label className="text-sm font-bold block mb-2">Constraints (One per line)</label>
              <textarea name="constraints" defaultValue={constraintsStr} rows={5} placeholder="- Can only push one object at a time" className="w-full" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold block mb-2">Media URLs (One per line)</label>
              <textarea name="mediaUrls" defaultValue={mediaUrlsStr} rows={5} placeholder="https://youtube.com/..." className="w-full" />
            </div>
          </div>
          
          <Button type="submit" variant="primary" className="self-start mt-4">Save Changes</Button>
        </form>
      </BentoBox>
    </div>
  )
}
