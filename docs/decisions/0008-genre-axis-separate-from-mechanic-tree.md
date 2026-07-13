# 0008 Genre Is a Separate Game Axis, Not a Mechanic Tree Tier

Date: 2026-07-13

## Status

Accepted

## Context

The source taxonomy ("Building Blocks of Digital Puzzle Game Design", chapters
2 and 4) reads as a three-tier hierarchy: macro-taxonomy (Match-3,
Sokoban-like, Merge…) → mechanic groups (Object Manipulation, Spatial
Navigation…) → atomic mechanics (Push, Pull, Frictionless Slide…). A future
reader comparing the document with the schema will expect a single three-level
tree. The initial product request also asked for "3 tầng đầy đủ như PDF".

However, an atomic mechanic such as Push appears across many genres, so a
single tree would force either duplication of mechanics per genre or an
arbitrary primary-genre assignment.

## Decision

Model two independent structures:

1. A two-tier mechanic tree: `MechanicGroup` → `Mechanic` (atomic).
2. `Genre` as a separate classification axis attached many-to-many to `Game`.

Genre–mechanic relationships are derived through the games that link them,
not stored as hierarchy.

## Alternatives Considered

1. Single three-tier tree Genre → Group → Mechanic: rejected because mechanics
   are reused across genres; would require duplication or forced assignment.
2. Flat mechanics with free tags: rejected because it discards the taxonomy
   structure the project exists to preserve.

## Consequences

Positive:

- Mechanics stay unique and reusable; "games using Push" is one query.
- Genre pages can still show characteristic mechanics via linked-game data.

Tradeoffs:

- The schema visibly diverges from the document's apparent 3-tier layout;
  this ADR is the explanation.
- "Typical mechanics of a genre" is computed, not curated (can add curation
  later if needed).

## Follow-Up

- Seed script (US-002) must map chapter 2 entries to `Genre` rows and
  chapter 4 entries to `MechanicGroup`/`Mechanic` rows.
