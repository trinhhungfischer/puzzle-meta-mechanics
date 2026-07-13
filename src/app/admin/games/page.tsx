import prisma from '@/lib/prisma'
import Link from 'next/link'
import { deleteGame } from '../actions'
import { Button } from '@/components/ui/Button'
import { BentoBox } from '@/components/ui/BentoBox'
import { Pill } from '@/components/ui/Pill'

export default async function GamesAdminPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      genres: true,
      platforms: { include: { platform: true } },
      mechanics: { include: { mechanic: true } }
    }
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-black uppercase tracking-widest m-0">
          Manage Games
        </h1>
        <Button href="/admin/games/new">+ Add New Game</Button>
      </div>

      <div className="grid gap-6">
        {games.map(game => (
          <BentoBox key={game.id} className="flex flex-col sm:flex-row gap-6">
            {game.coverUrl ? (
              <img src={game.coverUrl} alt={`${game.title} cover`} className="w-full sm:w-[120px] h-[120px] object-cover border-2 border-outline flex-shrink-0 shadow-[4px_4px_0_var(--color-outline)]" />
            ) : (
              <div className="w-full sm:w-[120px] h-[120px] bg-box border-2 border-outline flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0_var(--color-outline)] bg-gradient-to-br from-green-tint to-blue-tint">
                <span className="text-4xl opacity-50 font-black uppercase">{game.title[0]}</span>
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                <h2 className="text-2xl font-black uppercase tracking-tight m-0 leading-none">{game.title}</h2>
                <div className="flex items-center gap-3">
                  <Link href={`/admin/games/${game.id}`} className="font-bold uppercase tracking-wider text-sm text-blue-solid hover:underline">
                    Edit
                  </Link>
                  <form action={async () => {
                    'use server'
                    await deleteGame(game.id)
                  }}>
                    <button type="submit" title="Delete Game" className="bg-transparent border-none cursor-pointer text-red-600 hover:text-red-800 text-xl font-bold leading-none">
                      &times;
                    </button>
                  </form>
                </div>
              </div>
              <p className="opacity-80 mb-4 line-clamp-2">{game.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {game.genres.map(g => (
                  <Pill key={g.id} color="pink">{g.name}</Pill>
                ))}
                {game.platforms.map(p => (
                  <Pill key={p.id} color="blue">{p.platform.name}</Pill>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {game.mechanics.map(m => (
                  <Pill key={m.id} color={m.role === 'core' ? 'default' : 'purple'} className="!text-[0.6rem] !px-2">
                    {m.mechanic.name} <span className="opacity-70 normal-case ml-1">({m.role})</span>
                  </Pill>
                ))}
              </div>
            </div>
          </BentoBox>
        ))}
        {games.length === 0 && <p className="opacity-50 text-lg font-bold">No games found.</p>}
      </div>
    </div>
  )
}
