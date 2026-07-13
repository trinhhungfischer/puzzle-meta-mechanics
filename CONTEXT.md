# Puzzle Meta-Mechanic Catalog

A reference catalog of digital puzzle games and the mechanics they are built
from, derived from the taxonomy in `private/`. Internal design tool first,
public-ready later. All catalog content is written in English.

## Language

**Game**:
A released digital puzzle game title (e.g. Braid, Portal) cataloged with its
platforms, genres, and mechanics.
_Avoid_: Title, entry

**Mechanic** (Atomic Mechanic):
The smallest indivisible unit of puzzle interaction (e.g. Push, Pull,
Frictionless Slide). Always belongs to exactly one Mechanic Group.
_Avoid_: Tag, feature, building block

**Mechanic Group**:
A family of related atomic mechanics from the encyclopedia's chapter 4
(e.g. Object Manipulation, Spatial Navigation & Movement). The top tier of
the mechanic tree.
_Avoid_: Category, type

**Platform**:
A distribution platform a Game is available on (PC/Steam, iOS, Android,
Switch, PlayStation, Xbox, Web). Seeded fixed list; each Game–Platform link
may carry a store URL.
_Avoid_: Store, device

**Mechanic Usage**:
The link between a Game and a Mechanic, carrying a role (core, secondary,
twist) and an optional note describing how that game applies the mechanic.
_Avoid_: Tagging, assignment

**Genre**:
A macro-classification of puzzle games from the taxonomy's chapter 2
(e.g. Match-3, Sokoban-like, Merge). A separate axis attached to Games,
NOT a tier above Mechanic Groups — a Genre correlates with mechanics but
does not contain them.
_Avoid_: Macro-category, game type
