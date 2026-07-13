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
| E01 Domain schema & seed | Prisma schema v1 + one-time taxonomy seed | sliced |
| E02 Admin curation | `/admin` CRUD + JSON bulk import | sliced |
| E03 Viewer catalog | Public-ready browse/search/detail pages | sliced |
| E04 Insight & public readiness | Derived relations, auth, deploy | sliced (deferred) |

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
| US-011 | Related games (shared mechanics) + co-occurring mechanics on detail pages | normal | Derived from GameMechanic data |
| US-012 | Admin auth gate before any public exposure | high-risk | Hard gate: auth; needs high-risk story folder + decision |
| US-013 | Validation ladder scripts: `validate:quick` (lint, typecheck) wired into story verification | tiny | Harness improvement |

## Suggested order

US-001 → US-002 → US-003/US-004 → US-006 → US-008 → US-009 → US-007 →
US-010 → US-005 → E04.
