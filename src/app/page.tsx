import prisma from '@/lib/prisma'
import Link from 'next/link'
import GameFilters from '@/components/GameFilters'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse filters
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
  const genre = typeof searchParams.genre === 'string' ? searchParams.genre : undefined
  const platform = typeof searchParams.platform === 'string' ? searchParams.platform : undefined
  
  // mechanics can be an array if multiple are selected
  let mechanics: string[] = []
  if (Array.isArray(searchParams.mechanic)) {
    mechanics = searchParams.mechanic
  } else if (typeof searchParams.mechanic === 'string') {
    mechanics = [searchParams.mechanic]
  }

  // Build query
  const where: any = {}
  
  if (q) {
    where.title = { contains: q }
  }
  
  if (genre) {
    where.genres = { some: { slug: genre } }
  }
  
  if (platform) {
    where.platforms = { some: { platform: { slug: platform } } }
  }
  
  if (mechanics.length > 0) {
    // Game must have ALL selected mechanics (AND logic)
    where.AND = mechanics.map(mechSlug => ({
      mechanics: { some: { mechanic: { slug: mechSlug } } }
    }))
  }

  const games = await prisma.game.findMany({
    where,
    orderBy: { title: 'asc' },
    include: {
      genres: true,
      platforms: { include: { platform: true } },
      mechanics: { include: { mechanic: true } }
    }
  })

  // Fetch data for filters
  const allGenres = await prisma.genre.findMany({ orderBy: { name: 'asc' } })
  const allPlatforms = await prisma.platform.findMany({ orderBy: { name: 'asc' } })
  const allMechanics = await prisma.mechanic.findMany({ orderBy: { name: 'asc' } })

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2.5rem', margin: 0 }}>
          Puzzle Game Catalog
        </h1>
        <Link href="/admin/games" className="btn" style={{ textDecoration: 'none' }}>Go to Admin</Link>
      </header>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <aside style={{ flex: '0 0 250px' }}>
          <GameFilters 
            genres={allGenres} 
            platforms={allPlatforms} 
            mechanics={allMechanics} 
            currentQ={q}
            currentGenre={genre}
            currentPlatform={platform}
            currentMechanics={mechanics}
          />
        </aside>

        {/* Results */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1rem', opacity: 0.8 }}>
            Found {games.length} games matching your criteria.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {games.map(game => (
              <Link href={`/games/${game.slug}`} key={game.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="thinky-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {game.coverUrl ? (
                    <img src={game.coverUrl} alt={`${game.title} cover`} style={{ height: '180px', objectFit: 'cover', borderRadius: '4px 4px 0 0', margin: '-1rem -1rem 1rem -1rem', width: 'calc(100% + 2rem)' }} />
                  ) : (
                    <div style={{ width: 'calc(100% + 2rem)', height: '180px', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px 4px 0 0', margin: '-1rem -1rem 1rem -1rem' }}>
                      <span style={{ fontSize: '3rem', opacity: 0.5 }}>{game.title[0]}</span>
                    </div>
                  )}
                  
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{game.title}</h2>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {game.genres.map(g => (
                      <span key={g.id} className="mechanic-pill" style={{ backgroundColor: 'var(--color-pink)', fontSize: '0.7rem' }}>{g.name}</span>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {game.mechanics.slice(0, 4).map(m => (
                      <span key={m.id} className="mechanic-pill" style={{ fontSize: '0.7rem' }}>
                        {m.mechanic.name}
                      </span>
                    ))}
                    {game.mechanics.length > 4 && (
                      <span className="mechanic-pill" style={{ fontSize: '0.7rem', backgroundColor: 'var(--border-color)', color: 'var(--bg-color)' }}>
                        +{game.mechanics.length - 4} MORE
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
