// iOS App Store crawler via the public iTunes Search API (US-025 mobile).
// One request returns up to 200 apps with full metadata — no per-app calls.

export type MobileGame = {
  title: string
  description: string | null
  coverUrl: string | null
  genres: string[]
  ratingScore: number | null // normalized 0-100
  reviewCount: number | null
  price: number | null // USD
  isFree: boolean
  releaseDate: Date | null
  releaseYear: number | null
  iosUrl?: string
  androidUrl?: string
  downloads?: number | null
}

const GENERIC_GENRES = new Set(['Games', 'Entertainment'])

function normalizeGenres(genres: string[] | undefined): string[] {
  return [...new Set((genres ?? []).filter(g => g && !GENERIC_GENRES.has(g)))]
}

/** star rating (0-5) → normalized 0-100, 1 decimal. */
function starToScore(star?: number): number | null {
  if (star == null || Number.isNaN(star)) return null
  return Math.round(star * 20 * 10) / 10
}

/** Top/popular puzzle apps on the iOS App Store. */
export async function searchIosPuzzleApps(limit = 200, term = 'puzzle'): Promise<MobileGame[]> {
  const url =
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}` +
    `&entity=software&limit=${Math.min(limit, 200)}&country=us`
  const res = await fetch(url, { headers: { 'User-Agent': 'puzzle-meta-mechanic-crawler/0.1' } })
  if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`)
  const json = (await res.json()) as { results: any[] }

  return json.results
    .filter(a => a.primaryGenreName === 'Games' || (a.genres ?? []).includes('Games'))
    .map(a => {
      const released = a.releaseDate ? new Date(a.releaseDate) : null
      return {
        title: (a.trackName as string)?.trim(),
        description: a.description || null,
        coverUrl: a.artworkUrl512 || a.artworkUrl100 || null,
        genres: normalizeGenres(a.genres),
        ratingScore: starToScore(a.averageUserRating),
        reviewCount: a.userRatingCount ?? null,
        price: typeof a.price === 'number' ? a.price : null,
        isFree: a.price === 0,
        releaseDate: released,
        releaseYear: released ? released.getUTCFullYear() : null,
        iosUrl: a.trackViewUrl,
      } as MobileGame
    })
    .filter(g => g.title)
}
