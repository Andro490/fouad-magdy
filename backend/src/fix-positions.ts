import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('./src/data/coaches.json', 'utf8'));
  
  await prisma.manager.deleteMany({}); // CLEAR DB
  
  for (let i = 0; i < data.length; i++) {
    const coach = data[i];
    const id = String(coach.id);
    const position = data.length - i;
    
    await prisma.manager.upsert({
      where: { id },
      update: { position },
      create: { id, data: coach as any, position }
    });
  }
  console.log(`Updated positions for ${data.length} managers.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
