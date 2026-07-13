import prisma from '@/lib/prisma'
import { createMechanic, deleteMechanic } from '../actions'
import Link from 'next/link'
import { BentoBox } from '@/components/ui/BentoBox'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'

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
      <h1 className="text-3xl font-black uppercase tracking-widest mb-8">
        Manage Mechanics
      </h1>

      <BentoBox color="purple" header="Add New Mechanic" className="mb-12">
        <form action={createMechanic} className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <input type="text" name="name" placeholder="Mechanic Name (e.g. Push)" required className="flex-1 min-w-[200px]" />
            <div className="flex-1 min-w-[200px]">
              <Dropdown 
                name="groupId" 
                required 
                placeholder="Select Group" 
                options={groups.map(g => ({ label: g.name, value: g.id }))} 
              />
            </div>
          </div>
          <input type="text" name="description" placeholder="Description (optional)" className="w-full" />
          
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label className="text-sm font-bold block mb-2">Constraints (One per line)</label>
              <textarea name="constraints" rows={3} placeholder="- Can only push one object at a time" className="w-full" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold block mb-2">Media URLs (One per line)</label>
              <textarea name="mediaUrls" rows={3} placeholder="https://youtube.com/..." className="w-full" />
            </div>
          </div>
          
          <Button type="submit" className="self-start">Add Mechanic</Button>
        </form>
      </BentoBox>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mechanics.map(mechanic => (
          <BentoBox key={mechanic.id} className="flex flex-col h-full !p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-purple-solid m-0">{mechanic.name}</h3>
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Group: {mechanic.group.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/mechanics/${mechanic.id}`} className="text-sm font-bold uppercase tracking-wider text-blue-solid hover:underline">
                  Edit
                </Link>
                <form action={async () => {
                  'use server'
                  await deleteMechanic(mechanic.id)
                }}>
                  <button type="submit" title="Delete Mechanic" className="bg-transparent border-none cursor-pointer text-red-600 hover:text-red-800 text-xl font-bold leading-none">
                    &times;
                  </button>
                </form>
              </div>
            </div>
            {mechanic.description && <p className="text-sm opacity-80 mt-2 mb-4 line-clamp-3">{mechanic.description}</p>}
            <div className="text-xs font-bold uppercase tracking-widest mt-auto pt-4 border-t-2 border-outline opacity-70">
              Used in {mechanic._count.games} games
            </div>
          </BentoBox>
        ))}
      </div>
    </div>
  )
}
