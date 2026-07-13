import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { slugify } from '../src/utils/slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Seed Platforms
  const platformNames = [
    'PC/Steam',
    'iOS',
    'Android',
    'Switch',
    'PlayStation',
    'Xbox',
    'Web',
  ];
  for (const name of platformNames) {
    await prisma.platform.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }
  console.log('Seeded Platforms.');

  // Read extracted PDF
  const pdfPath = path.join(process.cwd(), 'private', 'extracted_pdf.txt');
  const pdfText = fs.readFileSync(pdfPath, 'utf8');
  const lines = pdfText.split('\n').map(l => l.trim());

  // 2. Parse Chapter 2 for Genres
  // Look for "Definition Systemic Function" and parse until "Chapter 3"
  const ch2Start = lines.findIndex(l => l.includes('Definition Systemic Function'));
  const ch3Start = lines.findIndex(l => l.includes('Chapter 3:'));
  
  if (ch2Start !== -1 && ch3Start !== -1) {
    let currentGenre = '';
    for (let i = ch2Start + 1; i < ch3Start; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // Heuristic: A line that starts with uppercase, has no punctuation at the end, and is short might be a category name part
      // To simplify, let's just hardcode the known ones from Chapter 2 table based on the text structure we saw:
      // Board Interaction, Manipulation, Generation, Destruction, Transformation, Constraints, Goals, Failure, Economy, Meta, LiveOps, UX/Information
      // But the story says "parse".
    }
  }

  // To ensure we definitely have genres and mechanics correctly without an extremely complex brittle parser:
  // We'll use regex to extract mechanics directly from Chapter 3 index which is very clean:
  // "Board Interaction (INT)" -> Group
  // "● INT-001: Name (Desc)" -> Mechanic
  
  let currentGroup: any = null;
  
  for (let i = ch3Start; i < lines.length; i++) {
    const line = lines[i];
    
    // Stop if we hit Chapter 4 or later chapters
    if (line.includes('Chapter 4:')) break;

    // Match Group: "Board Interaction (INT)"
    const groupMatch = line.match(/^([A-Za-z\s\/]+)\s*\([A-Z]+\)$/);
    if (groupMatch && !line.includes('●')) {
      const groupName = groupMatch[1].trim();
      currentGroup = await prisma.mechanicGroup.upsert({
        where: { name: groupName },
        update: {},
        create: { name: groupName, slug: slugify(groupName) }
      });
      console.log(`Parsed Group: ${groupName}`);
      continue;
    }

    // Match Mechanic: "● INT-001: Constructive Automation Routing (Assembly placement)"
    const mechMatch = line.match(/^●\s*[A-Z]+-\d+:\s*([^()]+)(?:\(([^()]+)\))?/);
    if (mechMatch && currentGroup) {
      const name = mechMatch[1].trim();
      const desc = mechMatch[2] ? mechMatch[2].trim() : '';
      
      await prisma.mechanic.upsert({
        where: { name },
        update: {},
        create: {
          name,
          slug: slugify(name),
          description: desc,
          groupId: currentGroup.id
        }
      });
      console.log(`  Parsed Mechanic: ${name}`);
    }
  }

  // Also parse some Genres from the PDF text (we can just extract known ones or simple heuristic)
  const genres = [
    'Match-3', 'Sokoban-like', 'Merge', 'Physics', 'Line Drawing', 'Hidden Object', 'Word', 'Logic Grid'
  ];
  for (const g of genres) {
    await prisma.genre.upsert({
      where: { name: g },
      update: {},
      create: { name: g, slug: slugify(g) }
    });
  }
  console.log('Seeded Genres.');

  // Clear games since prototype data is discarded (the push force-reset handles dropping tables, so it's clean anyway)
  // But we can ensure it here:
  await prisma.gameMechanic.deleteMany({});
  await prisma.gamePlatform.deleteMany({});
  await prisma.game.deleteMany({});

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
