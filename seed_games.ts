
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function getMechanic(tag: string) {
  return await prisma.mechanic.findFirst({
    where: { name: { startsWith: tag } }
  });
}

async function getGenre(name: string) {
  return await prisma.genre.upsert({
    where: { slug: slugify(name) },
    update: {},
    create: { name, slug: slugify(name) }
  });
}

async function getPlatform(name: string) {
  return await prisma.platform.upsert({
    where: { slug: slugify(name) },
    update: {},
    create: { name, slug: slugify(name) }
  });
}

async function main() {
  console.log('Seeding starter games from PDF...');

  const pc = await getPlatform('PC/Steam');
  const ios = await getPlatform('iOS');
  const android = await getPlatform('Android');
  const playstation = await getPlatform('PlayStation');

  const match3 = await getGenre('Match-3');
  const merge = await getGenre('Merge');
  const sokoban = await getGenre('Sokoban-like');
  const puzzle = await getGenre('Puzzle');
  const logic = await getGenre('Logic');
  const automation = await getGenre('Automation');

  const gamesToSeed = [
    {
      title: 'Candy Crush Saga',
      desc: 'A wildly popular match-3 puzzle game where players swap candies to create lines of three or more.',
      releaseYear: 2012,
      genres: [match3],
      platforms: [ios, android, pc],
      mechanics: [
        { tag: 'MAN-101', role: 'core' },
        { tag: 'DES-002', role: 'core' },
        { tag: 'TRN-003', role: 'secondary' }
      ]
    },
    {
      title: 'Bejeweled',
      desc: 'The classic tile-matching puzzle video game by PopCap Games.',
      releaseYear: 2001,
      genres: [match3],
      platforms: [pc, ios, android],
      mechanics: [
        { tag: 'MAN-101', role: 'core' },
        { tag: 'DES-002', role: 'core' }
      ]
    },
    {
      title: 'Merge Mansion',
      desc: 'A puzzle game where players merge items to uncover a story and renovate a mansion.',
      releaseYear: 2020,
      genres: [merge],
      platforms: [ios, android],
      mechanics: [
        { tag: 'TRN-101', role: 'core' }, // Object Merge Progression
        { tag: 'ECO-001', role: 'secondary' } // Energy Depletion
      ]
    },
    {
      title: 'Baba Is You',
      desc: 'A puzzle game where you can change the rules by pushing blocks with words on them.',
      releaseYear: 2019,
      genres: [sokoban, logic],
      platforms: [pc, playstation],
      mechanics: [
        { tag: 'TRN-006', role: 'core' }, // Logic Gate Evaluation (Rule-Manipulation)
        { tag: 'CON-101', role: 'core' }, // Immovable Obstacles
        { tag: 'CON-102', role: 'secondary' }
      ]
    },
    {
      title: 'Sokoban',
      desc: 'The classic puzzle game where the player pushes boxes or crates around in a warehouse.',
      releaseYear: 1982,
      genres: [sokoban],
      platforms: [pc],
      mechanics: [
        { tag: 'CON-101', role: 'core' },
        { tag: 'GOAL-101', role: 'core' } // Spatial Intersection
      ]
    },
    {
      title: 'Unblock Me',
      desc: 'A classic sliding block puzzle game. The goal is to get the red block out of the board by sliding the other blocks out of the way.',
      releaseYear: 2009,
      genres: [puzzle],
      platforms: [ios, android],
      mechanics: [
        { tag: 'MAN-102', role: 'core' }, // Empty Space Sliding
        { tag: 'GOAL-201', role: 'core' } // Entity Extraction
      ]
    },
    {
      title: 'Water Sort Puzzle',
      desc: 'A liquid sorting puzzle game where you sort colored water in glasses until all colors are in the same glass.',
      releaseYear: 2020,
      genres: [puzzle],
      platforms: [ios, android],
      mechanics: [
        { tag: 'GEN-006', role: 'core' }, // Liquid Saturation Filling
        { tag: 'GOAL-102', role: 'core' } // Complete Area Coverage (or sorting goal)
      ]
    },
    {
      title: 'Portal 2',
      desc: 'A first-person puzzle-platform game that uses portals, lasers, and physics.',
      releaseYear: 2011,
      genres: [puzzle],
      platforms: [pc, playstation],
      mechanics: [
        { tag: 'MAN-020', role: 'core' }, // Optical Portal Routing
        { tag: 'INT-010', role: 'secondary' }, // Physics Slingshot
        { tag: 'TRN-001', role: 'secondary' } // Binary State Toggle
      ]
    },
    {
      title: 'Opus Magnum',
      desc: 'An open-ended programming puzzle game where you design and build machines that assemble potions and poisons.',
      releaseYear: 2017,
      genres: [automation, logic],
      platforms: [pc],
      mechanics: [
        { tag: 'GOAL-307', role: 'core' }, // Code Assembly Optimization
        { tag: 'GEN-003', role: 'secondary' } // Trajectory Spawners
      ]
    },
    {
      title: 'Factorio',
      desc: 'A game in which you build and maintain factories, focusing on resource gathering, research, and automation.',
      releaseYear: 2020,
      genres: [automation],
      platforms: [pc, playstation],
      mechanics: [
        { tag: 'MAN-022', role: 'core' }, // Moving Conveyor Belts
        { tag: 'GOAL-202', role: 'core' } // Resource Accumulation Threshold
      ]
    },
    {
      title: 'Minesweeper',
      desc: 'A single-player puzzle video game where the objective is to clear a rectangular board containing hidden mines without detonating any of them.',
      releaseYear: 1990,
      genres: [logic],
      platforms: [pc],
      mechanics: [
        { tag: 'FAIL-101', role: 'core' }, // Immediate State Failure
        { tag: 'GOAL-102', role: 'core' } // Complete Area Coverage
      ]
    },
    {
      title: 'Sudoku',
      desc: 'A logic-based, combinatorial number-placement puzzle.',
      releaseYear: 1979,
      genres: [logic],
      platforms: [pc, ios, android],
      mechanics: [
        { tag: 'CON-201', role: 'core' }, // Axis-Based Uniqueness Constraint
        { tag: 'GOAL-102', role: 'core' }
      ]
    }
  ];

  let added = 0;
  for (const g of gamesToSeed) {
    const slug = slugify(g.title);
    
    // Process mechanics
    const mechanicConnects = [];
    for (const m of g.mechanics) {
      const mech = await getMechanic(m.tag);
      if (mech) {
        mechanicConnects.push({
          mechanicId: mech.id,
          role: m.role,
          note: `Extracted from PDF Chapter 4 (${m.tag})`
        });
      } else {
        console.warn(`Mechanic ${m.tag} not found for game ${g.title}`);
      }
    }

    const platformConnects = g.platforms.map(p => ({ platformId: p.id }));

    // Upsert game
    const game = await prisma.game.upsert({
      where: { slug },
      update: {
        description: g.desc,
        releaseYear: g.releaseYear,
        genres: { set: [], connect: g.genres.map(genre => ({ id: genre.id })) }
      },
      create: {
        title: g.title,
        slug,
        description: g.desc,
        releaseYear: g.releaseYear,
        genres: { connect: g.genres.map(genre => ({ id: genre.id })) }
      }
    });

    // Reset game mechanics and platforms
    await prisma.gameMechanic.deleteMany({ where: { gameId: game.id } });
    await prisma.gamePlatform.deleteMany({ where: { gameId: game.id } });

    // Insert new ones
    for (const mc of mechanicConnects) {
      await prisma.gameMechanic.create({
        data: { gameId: game.id, mechanicId: mc.mechanicId, role: mc.role, note: mc.note }
      });
    }
    for (const pc of platformConnects) {
      await prisma.gamePlatform.create({
        data: { gameId: game.id, platformId: pc.platformId }
      });
    }
    
    console.log(`Seeded Game: ${g.title}`);
    added++;
  }

  console.log(`Done! Seeded ${added} games.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
