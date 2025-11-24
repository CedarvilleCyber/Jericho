import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding skill categories...");

  const categories = [
    { key: "ENUMERATION", label: "Enumeration" },
    { key: "WEB_EXPLOITATION", label: "Web Exploitation" },
    { key: "AD_EXPLOITATION", label: "Active Directory Exploitation" },
    { key: "WINDOWS_PRIVESC", label: "Windows Privilege Escalation" },
    { key: "LINUX_PRIVESC", label: "Linux Privilege Escalation" },
    { key: "POST_EXPLOITATION", label: "Post-Exploitation" },
  ];

  for (const { key, label } of categories) {
    await prisma.skillCategory.upsert({
      where: { key },
      update: { label },
      create: { key, label },
    });
  }

  console.log("✅ Skill categories seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
