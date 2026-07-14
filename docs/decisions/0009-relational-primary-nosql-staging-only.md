# 0009 Relational Stays System of Record; NoSQL Is Staging-Only

Date: 2026-07-13

## Status

Accepted

## Context

The product owner plans to grow the catalog from a hand-curated set (~12 games)
to a large crawled dataset and asked to "set up an external NoSQL database"
because "the database will be very large" and to support deeper filtering
(US-024 metrics, US-025 crawler, US-026 NoSQL).

Two facts shape the decision:

1. **Actual scale is modest.** A puzzle-game catalog across every platform,
   even fully crawled, is on the order of tens of thousands of games plus a few
   hundred thousand `GameMechanic` links — well under 1 GB. This is not "big
   data"; SQLite and Postgres both handle it comfortably with indexes.
2. **The core feature is relational.** The app's defining query is multi-facet
   AND filtering (games having *all* of mechanics {X, Y}, in genre G, on
   platform P, with rating/downloads thresholds). Set-intersection over
   many-to-many links is exactly where a relational engine with indexes wins
   and where a document model becomes awkward.

The genuine pain of scaling is therefore **concurrent writes during crawling**
(SQLite is single-writer: a crawler writing while the app reads will contend)
and **staging messy, schema-varying crawl payloads**, not raw row count.

## Decision

1. **The relational database remains the system of record.** All app queries
   (catalog, filters, detail pages) run against it.
2. **Migrate SQLite → Postgres** when crawling/concurrency begins (US-027).
   Postgres — not NoSQL — is the scale lever, because the bottleneck is
   concurrent writes, not volume.
3. **A NoSQL / document layer is permitted only as a raw-crawl staging store**
   (US-026): it holds unnormalized, source-shaped crawl payloads; an ETL step
   promotes chosen fields into Postgres. It is never the app's system of record.
   Prefer a Postgres `JSONB` staging table first; adopt a separate MongoDB only
   if a distinct operational reason appears (e.g. very high write throughput or
   an existing Mongo operational surface).
4. **A dedicated search engine** (Meilisearch / Typesense / Elasticsearch) is
   deferred until filtering is *measured* slow at real scale — not adopted
   preemptively.

## Alternatives Considered

1. **NoSQL as the primary database** (move the whole app to a document store):
   rejected. It would degrade the core many-to-many AND-filtering feature and
   require a large rewrite for no volume benefit at this scale.
2. **Stay on SQLite indefinitely:** rejected once crawling starts, because
   single-writer contention between the crawler and the reading app is a real
   operational limit.
3. **Adopt a search engine now:** rejected as premature; add only on measured
   need, sourced from Postgres.

## Consequences

Positive:

- The core relational query model is preserved and gets a concurrency-capable
  engine (Postgres) exactly when it's needed.
- Fragile, source-varying crawl data is decoupled from the clean app schema via
  a staging layer, without coupling the app to a second system of record.
- Avoids operating a second datastore (Mongo) unless a concrete reason emerges;
  `JSONB` staging keeps it to one engine.

Tradeoffs:

- US-026 ("set up NoSQL") is reframed and narrowed; if the owner specifically
  wants MongoDB regardless, that is an explicit deviation to revisit here.
- A Postgres migration (US-027) requires a provisioned Postgres instance and a
  connection string, which the SQLite dev setup does not need.

## Follow-Up

- US-027: migrate SQLite → Postgres (needs a provisioned instance).
- US-025: crawler writes raw payloads to the staging layer, not app tables.
- US-026: implement staging as a Postgres `JSONB` table unless a separate Mongo
  is justified; revisit this ADR if so.
- Add a search engine only after a measured filtering-latency problem.
