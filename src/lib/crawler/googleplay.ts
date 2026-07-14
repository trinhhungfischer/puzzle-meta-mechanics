// Google Play crawler via google-play-scraper (dev-only dependency; never
// imported by the Next app runtime). Provides real install counts, which the
// iOS/Steam sources lack. Dynamic import keeps the ESM lib out of app bundling.
import type { MobileGame } from './appstore'

// google-play-scraper is ESM; load it lazily and untyped to avoid CJS interop.
async function gp(): Promise<any> {
  const mod: any = await import('google-play-scraper')
  return mod.default ?? mod
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/** Top puzzle app ids on Google Play (TOP_FREE ∪ TOP_GROSSING), deduped. */
export async function discoverAndroidPuzzleAppIds(limit: number): Promise<string[]> {
  const gplay = await gp()
  const ids = new Set<string>()
  for (const collection of [gplay.collection.TOP_FREE, gplay.collection.TOP_GROSSING]) {
    try {
      const list = await gplay.list({
        category: gplay.category.GAME_PUZZLE,
        collection,
        num: Math.min(limit, 200),
        country: 'us',
      })
      for (const a of list) ids.add(a.appId)
    } catch {
      // one collection failing shouldn't abort discovery
    }
  }
  return [...ids].slice(0, limit)
}

const GENERIC = new Set(['Games', 'Entertainment'])

export async function fetchAndroidApp(appId: string): Promise<MobileGame | null> {
  const gplay = await gp()
  const a = await gplay.app({ appId, country: 'us' })
  if (!a?.title) return null
  const released = a.released ? new Date(a.released) : null
  // Only the primary genre ("Puzzle"); Play's `categories`/tags are noisy
  // (e.g. "Single player", "Stylized") and would pollute the Genre table.
  const genres = [a.genre].filter((g: string) => g && !GENERIC.has(g))
  return {
    title: String(a.title).trim(),
    description: a.summary || a.description || null,
    coverUrl: a.icon || null,
    genres: [...new Set(genres)],
    ratingScore: a.score != null ? Math.round(a.score * 20 * 10) / 10 : null,
    reviewCount: a.ratings ?? null,
    price: a.free ? 0 : typeof a.price === 'number' ? a.price : null,
    isFree: !!a.free,
    releaseDate: released && !Number.isNaN(released.getTime()) ? released : null,
    releaseYear: released && !Number.isNaN(released.getTime()) ? released.getUTCFullYear() : null,
    androidUrl: a.url,
    downloads: typeof a.minInstalls === 'number' ? a.minInstalls : null,
  }
}
