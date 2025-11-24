import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface ScenarioData {
  id: string;
  slug: string;
  name: string;
  description: string;
  teaser?: string;
  youtubeChannelId: string;
  advanced: string;
  topologyMap: string;
  questions: Array<{
    id: string;
    title: string;
    placeholder: string;
    validation: string;
    answer: string;
    skillCategory: string;  // Changed: now a string key like "ENUMERATION"
    pointValue: number;
  }>;
}

async function upsertScenario(scenarioData: ScenarioData) {
  console.log(`📝 Upserting scenario: ${scenarioData.name}`);

  // Upsert the scenario
  const scenario = await prisma.scenario.upsert({
    where: { id: scenarioData.id },
    update: {
      name: scenarioData.name,
      slug: scenarioData.slug,
      teaser: scenarioData.teaser,
      youtubeChannelId: scenarioData.youtubeChannelId,
      description: scenarioData.description,
      advanced: scenarioData.advanced,
      topologyMap: scenarioData.topologyMap,
    },
    create: {
      id: scenarioData.id,
      slug: scenarioData.slug,
      teaser: scenarioData.teaser,
      youtubeChannelId: scenarioData.youtubeChannelId,
      name: scenarioData.name,
      description: scenarioData.description,
      advanced: scenarioData.advanced,
      topologyMap: scenarioData.topologyMap,
    },
  });

  console.log(`✅ Scenario saved`);

  // Delete old questions and recreate them
  await prisma.curriculum.deleteMany({
    where: { scenarioId: scenario.id },
  });

  // Create new questions
  for (const question of scenarioData.questions) {
    // Look up the skill category ID by key
    const skillCategory = await prisma.skillCategory.findUnique({
      where: { key: question.skillCategory },
    });

    if (!skillCategory) {
      console.error(`❌ Skill category "${question.skillCategory}" not found!`);
      continue;
    }

    await prisma.curriculum.create({
      data: {
        id: question.id,
        title: question.title,
        placeholder: question.placeholder,
        validation: question.validation,
        answer: question.answer,
        skillCategoryId: skillCategory.id,  // Changed: use ID instead of enum
        pointValue: question.pointValue,
        scenarioId: scenario.id,
      },
    });
  }

  console.log(`✅ ${scenarioData.questions.length} questions created`);
}

async function main() {
  // Seed skill categories first
  console.log("🌱 Seeding skill categories...");
  const skillCategories = [
    { key: "ENUMERATION", label: "Enumeration" },
    { key: "WEB_EXPLOITATION", label: "Web Exploitation" },
    { key: "AD_EXPLOITATION", label: "Active Directory Exploitation" },
    { key: "WINDOWS_PRIVESC", label: "Windows Privilege Escalation" },
    { key: "LINUX_PRIVESC", label: "Linux Privilege Escalation" },
    { key: "POST_EXPLOITATION", label: "Post-Exploitation" },
  ];

  for (const category of skillCategories) {
    await prisma.skillCategory.upsert({
      where: { key: category.key },
      update: { label: category.label },
      create: { key: category.key, label: category.label },
    });
  }
  console.log("✅ Skill categories ready");

  // Then seed scenarios
  const trafficLights: ScenarioData = {
    id: "cmhze7pwm000104jreuf34n0m",
    slug: "traffic-light",
    name: "Traffic Lights",
    teaser: "Can you change the lights?",
    description:
      "In this scenario, you will learn about web exploitation by investigating " +
      "a local traffic light control system's website for vulnerabilities. We " +
      "have constructed a mock website that simulates something that you might " +
      "find in the real world. Your goal is to identify and exploit vulnerabilities " +
      "in the website to gain unauthorized access to the traffic light control system.",
    advanced: "Advanced settings and configurations will go here.",
    youtubeChannelId: "UCpIkfL-IyAxGNp4qR52zOFg",
    topologyMap: "/webapp/images/traffic-light-topology.png",
    questions: [
      {
        id: "cmhzeejja000204jr3yyv41xk",
        title: "What ports are open on the web server? (List in ascending order)",
        placeholder: "1002,3056",
        validation: "^(\\d{1,5})(,\\d{1,5})*$",
        answer: "22,443",
        skillCategory: "ENUMERATION",
        pointValue: 10,
      },
      {
        id: "cmhzehbaw000304jr4a118iuj",
        title: "Which page on the web server is exploitable?",
        placeholder: "/path",
        validation: "^/\\w+$",
        answer: "/login",
        skillCategory: "WEB_EXPLOITATION",
        pointValue: 15,
      },
      {
        id: "cmhzelbvt000404jr81fi6toi",
        title: "What are the credentials you logged into the web server with?",
        placeholder: "username:password",
        validation: "^\\w+:\\w+$",
        answer: "admin:password",
        skillCategory: "WEB_EXPLOITATION",
        pointValue: 20,
      },
      {
        id: "cmhzemr3p000504jr0u3u3xli",
        title:
          "The web server has access to an internal network that cannot be directly accessed from the internet. What is the IP address of the machine on the internal network?",
        placeholder: "192.168.1.xxx",
        validation: "^\\d{1,3}(\\.\\d{1,3}){3}$",
        answer: "192.168.1.100",
        skillCategory: "POST_EXPLOITATION",
        pointValue: 25,
      },
      {
        id: "cmhzenom0000704jr8iuq8ubc",
        title: "What are the credentials you logged into the OT server with?",
        placeholder: "username:password",
        validation: "^\\w+:\\w+$",
        answer: "admin:password",
        skillCategory: "POST_EXPLOITATION",
        pointValue: 20,
      },
    ],
  };

  await upsertScenario(trafficLights);

  console.log("✅ All scenarios updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
