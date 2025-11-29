import { prisma } from "@/prisma";

async function main() {
  console.log("📝 Populating skill categories for curriculum...");

  // Get category IDs
  const categories = await prisma.skillCategory.findMany();
  const categoryMap = new Map(categories.map((c) => [c.key, c.id]));

  // Map questions to their skill categories based on your original data
  const mappings = [
    { title: "What ports are open", category: "ENUMERATION" },
    { title: "Which page on the web server is exploitable", category: "WEB_EXPLOITATION" },
    { title: "What are the credentials you logged into the web server", category: "WEB_EXPLOITATION" },
    { title: "What is the IP address of the machine on the internal network", category: "POST_EXPLOITATION" },
    { title: "What are the credentials you logged into the OT server", category: "POST_EXPLOITATION" },
  ];

  for (const mapping of mappings) {
    const categoryId = categoryMap.get(mapping.category);
    if (!categoryId) {
      console.log(`❌ Category ${mapping.category} not found`);
      continue;
    }

    await prisma.curriculum.updateMany({
      where: { title: { contains: mapping.title } },
      data: { skillCategoryId: categoryId },
    });
    console.log(`✅ Updated "${mapping.title}" → ${mapping.category}`);
  }

  console.log("✅ All curriculum items updated!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
