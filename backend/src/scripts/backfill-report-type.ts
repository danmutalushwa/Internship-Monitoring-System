import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.report.updateMany({
    data: { type: 'internship' },
  });

  console.log(`✅ Updated ${result.count} reports with default type`);
}

main()
  .catch((e) => {
    console.error('❌ Error during backfill:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());