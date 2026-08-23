const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const managers = await prisma.manager.findMany();
  managers.forEach(m => {
    if (m.data && m.data.name && (m.data.name.includes('MA') || m.data.name.includes('Manager') || m.data.name === '' || m.data.country === 'فريق غير محدد' || m.data.name === 'M A')) {
      console.log('Found:', m.id, m.data.name, m.data.country);
    }
  });
  console.log('Total managers:', managers.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
