import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Cleaning AuditLog table...');

  // Move any non-numeric actor values into target, set actor to 1 (admin ID)
  const result = await prisma.$executeRawUnsafe(`
    UPDATE AuditLog
    SET target = actor, actor = 1
    WHERE actor NOT GLOB '[0-9]*';
  `);

  console.log(`Cleanup complete. Rows affected: ${result}`);
}

main()
  .catch((e) => {
    console.error('Error cleaning AuditLog:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });