import prisma from '@/lib/prisma'
import { updateGenre } from '../../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditGenrePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const genre = await prisma.genre.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!genre) {
    notFound()
  }

  return (
    <div>
      <Link href="/admin/genres" style={{ opacity: 0.8, textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Genres
      </Link>

      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '2rem' }}>
        Edit Genre
      </h1>

      <div className="bento-box color-pink" style={{ marginBottom: '2rem' }}>
        <form action={async (formData) => {
          'use server'
          await updateGenre(genre.id, formData)
        }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" name="name" defaultValue={genre.name} placeholder="Genre Name (e.g. Match-3)" required style={{ flex: '1 1 200px' }} />
          <input type="text" name="description" defaultValue={genre.description || ''} placeholder="Description (optional)" style={{ flex: '2 1 300px' }} />
          <button type="submit" className="btn">Save Changes</button>
        </form>
      </div>
    </div>
  )
}
