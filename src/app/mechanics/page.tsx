import prisma from '@/lib/prisma'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { MechanicCard } from '@/components/ui/MechanicCard'
import { Button } from '@/components/ui/Button'

export default async function MechanicsPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedParams = await searchParams
  const q = resolvedParams.q

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
    <PublicLayout>
      <div className="relative mb-16 rounded-3xl overflow-hidden glass-panel p-12 text-center flex flex-col items-center justify-center border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/10 via-zinc-950 to-brand-fuchsia/10 z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-fuchsia/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Mechanics <br/> <span className="gradient-text">Encyclopedia</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-0 leading-relaxed font-medium">
            The atomic building blocks of puzzle games, organized by systemic function.
          </p>
        </div>
      </div>

      <form className="mb-12 flex flex-col sm:flex-row gap-4 max-w-2xl">
        <input 
          type="text" 
          name="q" 
          defaultValue={q} 
          placeholder="Search mechanics by name..." 
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </form>

      {visibleGroups.map(group => (
        <section key={group.id} className="mb-16">
          <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-outline pb-2 mb-6 text-purple-solid">
            {group.name}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.mechanics.map(mechanic => (
              <MechanicCard key={mechanic.id} mechanic={mechanic} />
            ))}
          </div>
        </section>
      ))}

      {visibleGroups.length === 0 && (
        <div className="p-12 text-center opacity-50 bg-black/10 rounded-xl border border-outline/50">
          <p className="text-xl font-bold">No mechanics found matching "{q}".</p>
        </div>
      )}
    </PublicLayout>
  )
}
