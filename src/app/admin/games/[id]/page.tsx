import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import GameForm from '../new/GameForm'

export default async function EditGamePage({
  params,
}: {
  params: { id: string }
}) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: {
      genres: true,
      platforms: true,
      mechanics: true
    }
  })

  if (!game) {
    notFound()
  }

  const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } })
  const platforms = await prisma.platform.findMany({ orderBy: { name: 'asc' } })
  const mechanics = await prisma.mechanic.findMany({ orderBy: { name: 'asc' }, include: { group: true } })

  return (
    <div>
      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Edit Puzzle Game
      </h1>
      <GameForm 
        genres={genres} 
        platforms={platforms} 
        mechanics={mechanics} 
        initialData={game}
      />
    </div>
  )
}
