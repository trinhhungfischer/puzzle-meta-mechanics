/**
 * US-025 mobile crawler: top puzzle games on iOS (iTunes Search API) and
 * Android (google-play-scraper), merged by normalized title so a game that
 * exists on both platforms becomes ONE draft Game with both store links.
 *
 * Usage: npx tsx scripts/crawl-mobile.ts [iosLimit] [androidLimit]
 *   defaults: iosLimit 200, androidLimit 80
 */
import { PrismaClient } from '@prisma/client'
import { slugify } from '../src/utils/slugify'
import { searchIosPuzzleApps, type MobileGame } from '../src/lib/crawler/appstore'
import { discoverAndroidPuzzleAppIds, fetchAndroidApp, sleep } from '../src/lib/crawler/googleplay'

const prisma = new PrismaClient()
const ANDROID_DELAY_MS = 800

/** Merge Android data into an existing iOS record (or vice-versa). */
function merge(base: MobileGame, extra: MobileGame): MobileGame {
  return {
    ...base,
    description: base.description ?? extra.description,
    coverUrl: base.coverUrl ?? extra.coverUrl,
    genres: [...new Set([...base.genres, ...extra.genres])],
    ratingScore: base.ratingScore ?? extra.ratingScore,
    reviewCount: base.reviewCount ?? extra.reviewCount,
    price: base.price ?? extra.price,
    isFree: base.isFree || extra.isFree,
    releaseDate: base.releaseDate ?? extra.releaseDate,
    releaseYear: base.releaseYear ?? extra.releaseYear,
    iosUrl: base.iosUrl ?? extra.iosUrl,
    androidUrl: base.androidUrl ?? extra.androidUrl,
    // Android install count is the only real download signal — always prefer it.
    downloads: extra.downloads ?? base.downloads,
  }
}

async function main() {
  const args = process.argv.slice(2)
  const iosLimit = args[0] && /^\d+$/.test(args[0]) ? parseInt(args[0], 10) : 200
  const androidLimit = args[1] && /^\d+$/.test(args[1]) ? parseInt(args[1], 10) : 80

  // 1. iOS (one request, rich metadata)
  console.log('Fetching top iOS puzzle apps...')
  const ios = await searchIosPuzzleApps(iosLimit)
  console.log(`  iOS: ${ios.length} apps`)

  // 2. Android (discover ids, then per-app details for install counts)
  console.log('Discovering top Android puzzle apps...')
  const androidIds = await discoverAndroidPuzzleAppIds(androidLimit)
  console.log(`  Android: ${androidIds.length} app ids; fetching details...`)
  const android: MobileGame[] = []
  for (const appId of androidIds) {
    try {
      const g = await fetchAndroidApp(appId)
      if (g) android.push(g)
    } catch (e: any) {
      console.error(`  android ${appId}: ${e.message}`)
    }
    await sleep(ANDROID_DELAY_MS)
  }
  console.log(`  Android: ${android.length} apps with details`)

  // 3. Merge by slug
  const bySlug = new Map<string, MobileGame>()
  for (const g of ios) bySlug.set(slugify(g.title), g)
  let matched = 0
  for (const g of android) {
    const slug = slugify(g.title)
    if (bySlug.has(slug)) { bySlug.set(slug, merge(bySlug.get(slug)!, g)); matched++ }
    else bySlug.set(slug, g)
  }
  console.log(`\nMerged: ${bySlug.size} unique games (${matched} on both platforms)`)

  // Ensure the mobile platforms exist.
  const platforms: Record<string, string> = {}
  for (const name of ['iOS', 'Android']) {
    const p = await prisma.platform.upsert({
      where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) },
    })
    platforms[name] = p.id
  }

  // 4. ETL → draft games
  let etl = 0
  for (const [slug, g] of bySlug) {
    try {
      const MIN_REVIEWS = 10
      if ((g.reviewCount ?? 0) < MIN_REVIEWS) {
        console.log(`  Skipped ${g.title} due to low reviews (${g.reviewCount})`)
        continue
      }

      const genreConnect: { id: string }[] = []
      for (const gn of g.genres) {
        const gSlug = slugify(gn)
        const genre = await prisma.genre.upsert({
          where: { slug: gSlug }, update: {}, create: { name: gn, slug: gSlug },
        })
        genreConnect.push({ id: genre.id })
      }

      const metrics = {
        description: g.description, coverUrl: g.coverUrl, isFree: g.isFree,
        price: g.price, releaseYear: g.releaseYear, releaseDate: g.releaseDate,
        ratingScore: g.ratingScore, reviewCount: g.reviewCount, downloads: g.downloads ?? null,
        lastCrawledAt: new Date(),
      }
      const game = await prisma.game.upsert({
        where: { slug },
        update: { ...metrics, genres: { set: [], connect: genreConnect } },
        create: { title: g.title, slug, status: 'draft', ...metrics, genres: { connect: genreConnect } },
      })

      for (const [name, url] of [['iOS', g.iosUrl], ['Android', g.androidUrl]] as const) {
        if (!url) continue
        await prisma.gamePlatform.upsert({
          where: { gameId_platformId: { gameId: game.id, platformId: platforms[name] } },
          update: { 
            storeUrl: url,
            ratingScore: metrics.ratingScore,
            reviewCount: metrics.reviewCount,
            downloads: metrics.downloads,
            price: metrics.price,
            isFree: metrics.isFree,
          },
          create: { 
            gameId: game.id, 
            platformId: platforms[name], 
            storeUrl: url,
            ratingScore: metrics.ratingScore,
            reviewCount: metrics.reviewCount,
            downloads: metrics.downloads,
            price: metrics.price,
            isFree: metrics.isFree,
          },
        })
      }
      etl++
    } catch (e: any) {
      console.error(`  etl ${slug}: ${e.message}`)
    }
  }
  console.log(`\nDone. ETL'd ${etl} mobile games (draft) into the catalog.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
