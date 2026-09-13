const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const managers = await prisma.manager.findMany({
    orderBy: { position: 'desc' }
  });
  console.log(managers.map((m, i) => `${i}: ${m.data.name}`).join('\n'));
}

main().finally(() => prisma.$disconnect());
