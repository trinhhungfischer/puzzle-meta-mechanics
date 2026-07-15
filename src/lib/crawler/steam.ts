// Steam crawler fetchers (US-025). Pure network + parsing; no DB access here.
// Sources:
//   - SteamSpy tag API  → discover puzzle appids + owners (downloads proxy)
//   - Steam appdetails  → title, description, genres, price, platforms, release
//   - Steam appreviews  → review_score, total_reviews (rating signal)

export type SteamSpyApp = {
  appid: number
  name: string
  owners: string // e.g. "1,000,000 .. 2,000,000"
}

export type AppDetails = {
  name: string
  short_description?: string
  header_image?: string
  is_free?: boolean
  price_overview?: { final?: number; currency?: string }
  release_date?: { date?: string }
  genres?: { id: string; description: string }[]
  platforms?: { windows?: boolean; mac?: boolean; linux?: boolean }
}

export type ReviewSummary = {
  review_score?: number
  total_positive?: number
  total_negative?: number
  total_reviews?: number
}

const UA = { 'User-Agent': 'puzzle-meta-mechanic-crawler/0.1' }

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/**
 * fetch with retry/backoff on rate limits (429) and transient 5xx. Steam
 * throttles appdetails to roughly 200 requests / 5 min, so a long run needs to
 * ride out 429s rather than drop the game.
 */
async function fetchRetry(url: string, headers: Record<string, string>, tries = 3): Promise<Response> {
  let lastStatus = 0
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers })
    if (res.ok) return res
    lastStatus = res.status
    if (res.status === 429 || res.status >= 500) {
      await sleep(10000 * (i + 1)) // 10s, 20s, 30s backoff
      continue
    }
    return res // non-retryable (e.g. 404) — let caller handle
  }
  throw new Error(`rate-limited after ${tries} tries (last ${lastStatus})`)
}

/** Lower bound of a SteamSpy owners range string → integer (downloads proxy). */
export function parseOwnersLowerBound(owners?: string): number | null {
  if (!owners) return null
  const first = owners.split('..')[0]?.replace(/[^\d]/g, '')
  const n = first ? parseInt(first, 10) : NaN
  return Number.isFinite(n) ? n : null
}

/** Parse a Steam release_date.date ("25 Aug, 2016" / "Aug 25, 2016") → {year, date}. */
export function parseReleaseDate(raw?: string): { year: number | null; date: Date | null } {
  if (!raw) return { year: null, date: null }
  const t = Date.parse(raw)
  if (!Number.isNaN(t)) {
    const d = new Date(t)
    return { year: d.getUTCFullYear(), date: d }
  }
  const m = raw.match(/\b(19|20)\d{2}\b/)
  return { year: m ? parseInt(m[0], 10) : null, date: null }
}

const PUZZLE_TAG = 1664 // Steam store "Puzzle" tag id

/**
 * Discover puzzle appids from the Steam store search (top sellers first),
 * paging until `limit` unique appids are collected. SteamSpy's tag endpoint is
 * unreliable (often returns {}), so Steam search is the primary source here.
 * Owners/downloads are not available from search and stay null.
 */
export async function discoverPuzzleApps(limit: number): Promise<SteamSpyApp[]> {
  const ids: number[] = []
  const seen = new Set<number>()
  const pageSize = 50
  for (let start = 0; ids.length < limit && start < 2000; start += pageSize) {
    const url =
      `https://store.steampowered.com/search/results/?query&start=${start}&count=${pageSize}` +
      `&tags=${PUZZLE_TAG}&category1=998&filter=topsellers&supportedlang=english&infinite=1`
    const res = await fetchRetry(url, { 'User-Agent': 'Mozilla/5.0' })
    if (!res.ok) throw new Error(`Steam search failed: ${res.status}`)
    const json = (await res.json()) as { results_html?: string; total_count?: number }
    const html = json.results_html ?? ''
    const matches = [...html.matchAll(/data-ds-appid="(\d+)"/g)].map(m => parseInt(m[1], 10))
    if (matches.length === 0) break
    for (const id of matches) {
      if (!seen.has(id)) { seen.add(id); ids.push(id) }
    }
    await sleep(500)
  }
  return ids.slice(0, limit).map(appid => ({ appid, name: '', owners: '' }))
}

export async function fetchAppDetails(appid: number): Promise<AppDetails | null> {
  const res = await fetchRetry(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=english`,
    UA,
  )
  if (!res.ok) throw new Error(`appdetails ${appid} failed: ${res.status}`)
  const json = (await res.json()) as Record<string, { success: boolean; data?: AppDetails }>
  const entry = json[String(appid)]
  return entry?.success ? entry.data ?? null : null
}

export async function fetchSteamSpyTags(appid: number): Promise<Record<string, number> | null> {
  const res = await fetchRetry(`https://steamspy.com/api.php?request=appdetails&appid=${appid}`, UA)
  if (!res.ok) return null
  const json = await res.json()
  return json?.tags ?? null
}

export async function fetchReviewSummary(appid: number): Promise<ReviewSummary | null> {
  const res = await fetchRetry(
    `https://store.steampowered.com/appreviews/${appid}?json=1&language=all&purchase_type=all&num_per_page=0`,
    UA,
  )
  if (!res.ok) throw new Error(`appreviews ${appid} failed: ${res.status}`)
  const json = (await res.json()) as { success: number; query_summary?: ReviewSummary }
  return json?.success ? json.query_summary ?? null : null
}

/** Steam review score → normalized 0-100 (% positive). */
export function ratingScoreFromReviews(r: ReviewSummary | null): number | null {
  if (!r || !r.total_reviews) return null
  const total = r.total_reviews
  const pos = r.total_positive ?? 0
  return total > 0 ? Math.round((pos / total) * 1000) / 10 : null
}
