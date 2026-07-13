import prisma from '@/lib/prisma'
import GameForm from './GameForm'

export default async function NewGamePage() {
  const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } })
  const platforms = await prisma.platform.findMany({ orderBy: { name: 'asc' } })
  const mechanics = await prisma.mechanic.findMany({ orderBy: { name: 'asc' }, include: { group: true } })

  return (
    <div>
      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Add New Puzzle Game
      </h1>
      <GameForm genres={genres} platforms={platforms} mechanics={mechanics} />
    </div>
  )
}
