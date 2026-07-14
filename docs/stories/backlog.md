# Story Backlog

Product: Puzzle Meta-Mechanic Catalog — a reference site cataloging digital
puzzle games (multi-platform) and the atomic mechanics they are built from.
Internal design tool first, public-ready later. Domain language lives in
`CONTEXT.md`; taxonomy modeling decision in
`docs/decisions/0008-genre-axis-separate-from-mechanic-tree.md`.

Decisions locked at intake (2026-07-13):

- Audience: internal team first, architecture must stay public-ready
  (viewer routes separated from `/admin`, slugged URLs).
- Mechanic tree is `MechanicGroup → Mechanic`; `Genre` is a separate axis on
  `Game` (ADR 0008). `Platform` is a seeded table; Game–Platform links carry
  store URLs. Game–Mechanic links carry role (core/secondary/twist) + note.
- Content source: one-time seed from `private/` taxonomy docs, then the
  database is the source of truth. Existing `dev.db` prototype data is
  discarded. All catalog content in English.
- Games enter manually first; JSON bulk import follows. No external APIs,
  no file uploads (media = external URLs) in v1.

## Epics

| Epic | Description | Status |
| --- | --- | --- |
| E01 Domain schema & seed | Prisma schema v1 + one-time taxonomy seed | done |
| E02 Admin curation | `/admin` CRUD + JSON bulk import | in progress |
| E03 Viewer catalog | Public-ready browse/search/detail pages | built (blocked by E05-001) |
| E04 Insight & public readiness | Derived relations, auth, deploy | deferred |
| E05 Stabilization | Build fixes, edit flows, cleanup found during review | done |

## Progress review (2026-07-13)

Most of the catalog was implemented between sessions. Verified against code +
`dev.db` (10 groups, 154 mechanics, 8 genres, 7 platforms, 0 games seeded):

| ID | State | Notes |
| --- | --- | --- |
| US-001 | done | schema.prisma matches ADR 0008; migration + data present |
| US-002 | done | `prisma/seed.ts` parses chapter 3 index; `scripts/seed_from_pdf.ts` is stale/dead |
| US-003 | partial | create + delete + list done; **no edit**; create-only relation editor |
| US-004 | partial | create + delete for all entities; **no media/constraints editor**; no edit |
| US-005 | partial | import route upserts, but no dry-run, no validation report, silent Uncategorized group |
| US-006 | done | home filters (genre × platform × mechanics) + text search |
| US-007 | done | `games/[slug]` with platforms, genres, mechanic usages by role |
| US-008 | done | `mechanics/` grouped by MechanicGroup + search |
| US-009 | done | `mechanics/[slug]` with definition, constraints, media, games-using |
| US-010 | done | `genres/` + `genres/[slug]` |
| US-011 | not started | related games / co-occurring mechanics |
| US-012 | not started | admin auth |
| US-013 | not started | validation ladder scripts |

**Blocker:** the app does not build. Five files contain literal
backslash-escaped backticks (`\`...\``) instead of template literals:
`src/app/page.tsx`, `src/app/mechanics/page.tsx`,
`src/app/mechanics/[slug]/page.tsx`, `src/app/admin/import/page.tsx`,
`src/components/GameFilters.tsx`. `tsc` and `next build` fail until fixed.

### E05 Stabilization (done)

| ID | Story | Status | Notes |
| --- | --- | --- | --- |
| US-014 | Fix escaped backticks in 5 files so `next build` passes | done | **Highest priority — blocks running the app** |
| US-015 | Add edit flow for games, mechanics, groups, genres, platforms | done | Completes US-003/US-004; delete+recreate currently loses relations |
| US-016 | Mechanic admin editor for `mediaUrls` + `constraints` JSON | done | Completes US-004; fields exist in schema + detail page only |
| US-017 | JSON import dry-run + validation report + surface Uncategorized mechanics | done | Completes US-005 |
| US-018 | Fix nav (`/games` 404) and delete dead files: root `actions.ts`, `Brainstorm.tsx`, `MechanicSelector.tsx`, `scripts/seed_from_pdf.ts` | done | Nav points to a non-existent index route |
| US-019 | Comprehensive UI/UX overhaul across the whole site | done | Presentation-only; do after US-014 so the app runs first |

#### US-019 — Comprehensive UI/UX overhaul

**Problem.** A design system exists in `globals.css` (neo-brutalist bento /
"thinky" cards, CSS custom properties, dark-mode tokens) but pages ignore it:
every page hand-writes large inline `style={{…}}` objects, spacing/typography
are inconsistent, Tailwind v4 is installed but effectively unused, and there is
no shared layout shell, empty state, or responsive strategy. Reference target
is the polish level of thinkygames.com/games.

**Scope (presentation only — no schema, data, or route-contract changes):**

- Design tokens: consolidate color/spacing/typography/radius into one source
  (globals.css tokens or a Tailwind theme) and pick ONE styling approach;
  stop mixing inline styles with utility classes.
- Shared shell: header/nav (fix the current links), page container, footer,
  consistent page-title block; move repeated inline layout into components.
- Reusable components: GameCard, MechanicCard, Pill/Tag, FilterSidebar,
  Section header, Button, empty-state, loading/skeleton — replacing the
  inline-styled duplicates on home, games, mechanics, genres, admin.
- Responsive + accessibility pass: mobile layout for the filter sidebar and
  card grids, focus states, alt text, color-contrast in both themes,
  keyboard-navigable filters.
- Visual polish: cover-image fallbacks, hover/transition consistency,
  genre/platform/role pill color legend, typographic hierarchy.
- Admin vs viewer: give `/admin` a clearly distinct but consistent look so
  curation screens don't read like public pages.

**Out of scope:** new features, new data fields, auth, related-games logic
(US-011). Those stay in their own stories.

**Done when:** every current page renders through shared components with no
ad-hoc inline layout blocks, works at mobile + desktop widths in light and
dark mode, and `next build` still passes.

**Dependency:** US-014 (build must pass first). Recommended before public
exposure (US-012) and before US-011.

## Stories

### E01 Domain schema & seed

| ID | Story | Lane | Notes |
| --- | --- | --- | --- |
| US-001 | Domain schema v1: `MechanicGroup`, `Mechanic` (mediaUrls, constraints), `Genre`, `Platform`, `Game`, explicit `GameMechanic` (role, note), `GamePlatform` (storeUrl); slugs on all public entities; drop-and-recreate `dev.db` | normal | Data-model flag; prototype data intentionally discarded |
| US-002 | One-time seed script: parse `private/extracted_pdf.txt` (English source) into Groups/Mechanics (ch. 4), Genres (ch. 2); seed fixed Platform list | normal | After seed, DB is source of truth; doc stays reference-only |

### E02 Admin curation

| ID | Story | Lane | Notes |
| --- | --- | --- | --- |
| US-003 | Rebuild game admin under `/admin/games`: CRUD with genre picker, platform + store-URL editor, mechanic usage editor (role + note) | normal | Replaces current `/games` form |
| US-004 | Admin CRUD for mechanics, groups, genres, platforms incl. media URL list per mechanic | normal | Replaces current `/mechanics` form |
| US-005 | JSON bulk import: documented JSON schema, dry-run validation report, dedupe by title/slug, upsert to DB | normal | Manual entry remains primary path |

### E03 Viewer catalog

| ID | Story | Lane | Notes |
| --- | --- | --- | --- |
| US-006 | Games index with combined filters (genre × platform × one-or-more mechanics) + name text search | normal | Core lookup: "games using Push + Time Rewind on mobile" |
| US-007 | Game detail page at slugged URL: cover, description, platform icons with store links, genres, mechanic usages grouped by role | normal | |
| US-008 | Mechanics index organized by MechanicGroup (encyclopedia table of contents) + name search | normal | Replaces flat mechanics list |
| US-009 | Mechanic detail page: definition, operating constraints, external media embeds, games-using list with role/note | normal | |
| US-010 | Genre index + genre detail listing its games | tiny | |

### E04 Insight & public readiness (deferred until E01–E03 done)

| ID | Story | Lane | Notes |
| --- | --- | --- | --- |
| US-011 | Related games (shared mechanics) + co-occurring mechanics on detail pages | **done** | `src/lib/relations.ts`; Related Games on game detail, Frequently Paired With on mechanic detail. Verified e2e |
| US-012 | Admin auth gate before any public exposure | high-risk | Hard gate: auth; needs high-risk story folder + decision |
| US-013 | Validation ladder scripts: `validate:quick` (lint, typecheck) wired into story verification | tiny | Harness improvement |

## Suggested order

US-001 → US-002 → US-003/US-004 → US-006 → US-008 → US-009 → US-007 →
US-010 → US-005 → E04.

### E06 Follow-up & Polish (done)

| ID | Story | Status | Notes |
| --- | --- | --- | --- |
| US-020 | Retain original PDF tags (e.g., INT-001) in Mechanic names | done | DB update script run to modify 154 mechanics |
| US-021 | Seed starter games from PDF examples | done | 12 representative games created |
| US-022 | Fix Game Filters UX (scroll to top & overlapping mechanics) | done | Updated query params behavior to support comma-separated mechanic array and disabled scroll |
| US-023 | Fix Next.js 15+ asynchronous `params` in all dynamic routes | done | Resolved crash when opening detail pages |
| US-024 | Polish UI: Update Android/iOS icons and add icons to Platform filter dropdown | done | Replaced Smartphone with Bot, added icon property to Dropdown Option |

### E07 Scale & data enrichment (new — 2026-07-13)

Goal: grow the catalog from a hand-curated set to a large crawled dataset, with
richer per-game signals so filtering/sorting can be more precise.

| ID | Story | Lane | Notes |
| --- | --- | --- | --- |
| US-024 | Add game metric fields for richer filtering/sorting | **done** | Aggregate metrics on `Game` + sort/minRating/free filters; verified e2e. Per-platform metrics deferred to crawler (US-025) |
| US-025 | Crawler / ingestion pipeline for external game data | **tracer done (Steam)** | `src/lib/crawler/steam.ts` + `scripts/crawl-steam.ts` (`npm run crawl:steam [limit] [appid…]`). Discover via Steam search (Puzzle tag), stage raw in `CrawlRecord` (JSONB, ADR 0009), ETL → Game + Genre + PC/Steam link + metrics. Verified e2e |

#### US-025 — Steam crawler (tracer-bullet slice, follow-ups)

Done: staging table `CrawlRecord`, Steam appdetails + appreviews fetch, Steam-search
discovery, ETL into Game (title, description, cover, genres, price/isFree,
releaseYear/Date, ratingScore, reviewCount, PC/Steam store link). Mechanics are
deliberately **not** inferred — they stay curated.

Follow-ups (own stories when picked up):
- **Data quality:** the Steam "Puzzle" tag is broad (pulls in e.g. Car Mechanic
  Sim). ✅ **Review gate shipped (US-029):** crawled games land as `draft`,
  hidden from the public viewer until an admin publishes them. Still open:
  optional crawl-time filtering (min reviews, genre allow-list) to shrink the
  review queue.
- **Downloads metric:** not populated (Steam search has no owners); enrich per-app
  from SteamSpy `appdetails` if wanted.
- **Scheduling + incremental refresh:** re-crawl to refresh metrics; respect rate
  limits; record ToS considerations.
- **Trigger surface:** an `/admin` button or scheduled job instead of a manual script.
- **More sources:** App Store / Google Play for mobile puzzle games.
| US-027 | Migrate SQLite → Postgres as system of record | **done** | Supabase (ap-south-1) via **session pooler** — direct host is IPv6-only/unreachable. Data migrated preserving ids; verified e2e. `.env` gitignored |
| US-026 | Raw-crawl staging store (Postgres JSONB, or MongoDB if kept separate) | high-risk | Reframed after advice: NoSQL is NOT the primary DB. Staging only, ETL into Postgres. Do only if crawl payloads are messy enough to warrant it |

**Recommendation (2026-07-13, owner asked to advise):** keep the relational
store as system of record; the genuine scale move is US-027 (Postgres), not a
NoSQL primary DB. A puzzle catalog even fully crawled is ~tens of thousands of
rows — well within Postgres. Use a document/JSONB layer only as a *raw-crawl
staging area* (US-026), and add a search engine (Meilisearch/Typesense) only if
filtering is *measured* slow at scale — not preemptively. Suggested order:
US-024 → US-027 → US-025 → (US-026 if needed) → search engine (only if measured).
An ADR should record the "relational stays primary; NoSQL is staging-only"
decision before US-026/US-027 start.
**→ Recorded: `docs/decisions/0009-relational-primary-nosql-staging-only.md` (Accepted 2026-07-13).**
US-025 and US-027 are now blocked on one owner decision: where Postgres is hosted.

#### US-024 — Game metric fields

**Goal.** Add quantitative signals to games so the index can filter and sort by
popularity/quality, not just genre/platform/mechanic.

**Candidate fields:**

- `ratingScore` (normalized 0–100) and `ratingCount`
- `downloads` (or a bucket enum: <10k / 10k–100k / 100k–1M / 1M+)
- `reviewCount`
- `price` + `isFree` (or a price band)
- `popularity`/`wishlist` rank (optional)
- `releaseDate` (finer than the current `releaseYear`)
- `lastCrawledAt` provenance timestamp
- new filter/sort UI on the games index (min rating, free-only, sort by
  downloads/rating)

**Open modeling decision (needs resolving before schema change):** ratings and
downloads are **per store/platform**, not per game (Steam rating ≠ Play Store
rating). Options: (a) put metrics on `GamePlatform` and show an aggregate on the
game card, (b) denormalize an aggregate onto `Game` for fast filtering plus
per-platform detail on `GamePlatform`, (c) keep a single blended number on
`Game` only. Recommend (b). Confirm before migrating.

**Out of scope:** the crawler that fills these fields (US-025) and where raw
data is staged (US-026).

#### US-026 — External NoSQL datastore (blocked)

Stated driver: the database "will be very large" once crawling starts, and to
support deeper filtering. **Before this becomes an implementation story, the
role of the NoSQL store must be decided** (see the pending product question).
Candidate roles, each a different amount of work:

- **Raw-crawl staging store** (e.g. MongoDB): hold messy, schema-varying crawl
  payloads; an ETL step normalizes chosen fields into the existing relational
  DB, which the app keeps querying. Complements, does not replace. *(Lowest
  risk; recommended if the driver is crawl volume/shape.)*
- **Primary DB replacement**: move the whole app off SQLite/Prisma-relational to
  a document store. Large rewrite; the m:n mechanic×genre×platform AND-filtering
  the app is built around is harder in a document model.
- **Search/facet engine** (Meilisearch / Typesense / Elasticsearch): not a
  general NoSQL DB, but the right tool if the real need is fast filtered search
  at scale rather than a new system of record.

Note: a puzzle-game catalog — even fully crawled — is likely tens of thousands
of rows, which SQLite/Postgres handle comfortably with indexes. "Large" alone
may not justify a second datastore; the justification is more likely raw-crawl
shape or search performance. This is why the decision is gated.
