/**
 * US-025 Steam crawler (tracer-bullet vertical slice).
 *
 * Flow (per ADR 0009): discover puzzle apps → store raw payloads in the
 * CrawlRecord staging table → ETL selected fields into Game (+ Genre, +
 * GamePlatform "PC/Steam"). Mechanics are NOT inferred — they stay curated.
 *
 * Usage:
 *   npx tsx scripts/crawl-steam.ts [limit] [appid ...]
 *     limit    number of puzzle apps to crawl (default 8)
 *     appid... optional explicit appids (skips SteamSpy discovery)
 */
import { PrismaClient } from '@prisma/client'
import { slugify } from '../src/utils/slugify'
import {
  discoverPuzzleApps,
  fetchAppDetails,
  fetchReviewSummary,
  ratingScoreFromReviews,
  parseOwnersLowerBound,
  parseReleaseDate,
  sleep,
  type SteamSpyApp,
} from '../src/lib/crawler/steam'

const prisma = new PrismaClient()
const STEAM_DELAY_MS = 1500 // be polite to Steam's rate limit

async function stage(source: string, sourceId: string, kind: string, payload: any, error?: string) {
  await prisma.crawlRecord.upsert({
    where: { source_sourceId_kind: { source, sourceId, kind } },
    update: { payload, error: error ?? null, fetchedAt: new Date(), processedAt: null },
    create: { source, sourceId, kind, payload, error: error ?? null },
  })
}

async function main() {
  const args = process.argv.slice(2)
  const limit = args[0] && /^\d+$/.test(args[0]) ? parseInt(args[0], 10) : 8
  const explicitIds = args.filter(a => /^\d+$/.test(a)).slice(args[0] && /^\d+$/.test(args[0]) ? 1 : 0)

  // 1. Discovery
  let apps: SteamSpyApp[]
  if (explicitIds.length > 0) {
    apps = explicitIds.map(id => ({ appid: parseInt(id, 10), name: '', owners: '' }))
    console.log(`Using ${apps.length} explicit appid(s).`)
  } else {
    console.log('Discovering puzzle apps from Steam search (top sellers)...')
    apps = await discoverPuzzleApps(limit)
    console.log(`Discovered ${apps.length} apps.`)
  }

  // Ensure the Steam platform exists.
  const steam = await prisma.platform.upsert({
    where: { slug: slugify('PC/Steam') },
    update: {},
    create: { name: 'PC/Steam', slug: slugify('PC/Steam') },
  })

  let etlCount = 0
  for (const app of apps) {
    const id = app.appid
    try {
      // 2. Fetch + stage raw
      const details = await fetchAppDetails(id)
      await stage('steam', String(id), 'appdetails', details ?? { success: false })
      await sleep(STEAM_DELAY_MS)

      const reviews = await fetchReviewSummary(id)
      await stage('steam', String(id), 'reviews', reviews ?? { success: false })
      await sleep(STEAM_DELAY_MS)

      if (!details?.name) {
        console.log(`  ${id}: no appdetails (skipped ETL)`)
        continue
      }

      // 3. ETL → Game
      const { year, date } = parseReleaseDate(details.release_date?.date)
      const genreConnect: { id: string }[] = []
      for (const g of details.genres ?? []) {
        const gSlug = slugify(g.description)
        const genre = await prisma.genre.upsert({
          where: { slug: gSlug },
          update: {},
          create: { name: g.description, slug: gSlug },
        })
        genreConnect.push({ id: genre.id })
      }

      const slug = slugify(details.name)
      const metrics = {
        description: details.short_description || null,
        coverUrl: details.header_image || null,
        isFree: details.is_free ?? false,
        price: details.is_free ? 0 : details.price_overview?.final != null ? details.price_overview.final / 100 : null,
        releaseYear: year,
        releaseDate: date,
        ratingScore: ratingScoreFromReviews(reviews),
        reviewCount: reviews?.total_reviews ?? null,
        downloads: parseOwnersLowerBound(app.owners),
        lastCrawledAt: new Date(),
      }

      // New crawled games land as "draft" for admin review; re-crawling an
      // existing game refreshes metrics but never changes its publish status.
      const game = await prisma.game.upsert({
        where: { slug },
        update: { ...metrics, genres: { set: [], connect: genreConnect } },
        create: { title: details.name, slug, status: 'draft', ...metrics, genres: { connect: genreConnect } },
      })

      await prisma.gamePlatform.upsert({
        where: { gameId_platformId: { gameId: game.id, platformId: steam.id } },
        update: { storeUrl: `https://store.steampowered.com/app/${id}` },
        create: { gameId: game.id, platformId: steam.id, storeUrl: `https://store.steampowered.com/app/${id}` },
      })

      await prisma.crawlRecord.updateMany({
        where: { source: 'steam', sourceId: String(id) },
        data: { processedAt: new Date() },
      })

      etlCount++
      console.log(`  ${id}: ${details.name} → rating ${metrics.ratingScore ?? '-'} / ${metrics.reviewCount ?? '-'} reviews`)
    } catch (e: any) {
      await stage('steam', String(id), 'error', { message: e.message }, e.message)
      console.error(`  ${id}: ERROR ${e.message}`)
    }
  }

  console.log(`\nDone. ETL'd ${etlCount}/${apps.length} games into the catalog.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
