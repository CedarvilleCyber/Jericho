import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing all user answers...");

  const result = await prisma.userAnswers.deleteMany({});

  console.log(`✅ Deleted ${result.count} user answers`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
