import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading extracted PDF text...');
  const filePath = path.join(process.cwd(), 'private', 'extracted_pdf.txt');
  const text = fs.readFileSync(filePath, 'utf-8');

  // Regex pattern to match: ● [PREFIX]-[NUMBER]: [Name] ([Description])
  // Example: ● INT-001: Constructive Automation Routing (Assembly placement)
  // Sometimes there might be a space after the bullet point or not.
  const regex = /●\s*([A-Z]+-\d{3}):\s*(.*?)\s*\((.*?)\)/g;

  let match;
  let count = 0;

  console.log('Parsing and seeding mechanics...');

  while ((match = regex.exec(text)) !== null) {
    const code = match[1].trim(); // e.g., INT-001
    const name = match[2].trim(); // e.g., Constructive Automation Routing
    const description = match[3].trim(); // e.g., Assembly placement

    const fullName = `[${code}] ${name}`;

    try {
      await prisma.mechanic.upsert({
        where: { name: fullName },
        update: { description },
        create: {
          name: fullName,
          description: description,
        },
      });
      count++;
      console.log(`Seeded: ${fullName}`);
    } catch (e) {
      console.error(`Error seeding ${fullName}:`, e);
    }
  }

  console.log(`\nSuccessfully seeded ${count} mechanics from the PDF!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
