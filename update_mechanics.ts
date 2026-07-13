import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function main() {
  const pdfPath = path.join(process.cwd(), 'private', 'extracted_pdf.txt');
  const pdfText = fs.readFileSync(pdfPath, 'utf8');
  const lines = pdfText.split('\n').map(l => l.trim());

  let count = 0;
  for (const line of lines) {
    const mechMatch = line.match(/^[^A-Z]*([A-Z]+-\d+):\s*([^()]+)(?:\(([^()]+)\))?/);
    if (mechMatch) {
      const tag = mechMatch[1].trim();
      const oldName = mechMatch[2].trim();
      const newName = `${tag}: ${oldName}`;
      const newSlug = slugify(newName);

      try {
        const existing = await prisma.mechanic.findFirst({
          where: {
            OR: [
              { name: oldName },
              { name: newName }
            ]
          }
        });

        if (existing && existing.name !== newName) {
          await prisma.mechanic.update({
            where: { id: existing.id },
            data: { 
              name: newName,
              slug: newSlug
            }
          });
          console.log(`Updated: ${oldName} -> ${newName}`);
          count++;
        }
      } catch (e) {
        console.error('Error updating ' + oldName, e);
      }
    }
  }
  console.log(`Done! Updated ${count} mechanics.`);
}

main().finally(() => prisma.$disconnect());
