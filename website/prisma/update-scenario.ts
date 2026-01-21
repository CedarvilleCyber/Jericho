import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface ScenarioData {
  id: string;
  slug: string;
  name: string;
  description: string;
  teaser?: string;
  youtubeChannelId: string;
  learningObjectives?: string;
  advanced: string;
  topologyMap: string;
  questions: Array<{
    id: string;
    title: string;
    placeholder: string;
    validation: string;
    answer: string;
    skillCategories: string[];  // Changed: now a string key like "ENUMERATION"
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
      learningObjectives: scenarioData.learningObjectives,
      description: scenarioData.description,
      advanced: scenarioData.advanced,
      topologyMap: scenarioData.topologyMap,
    },
    create: {
      id: scenarioData.id,
      slug: scenarioData.slug,
      teaser: scenarioData.teaser,
      youtubeChannelId: scenarioData.youtubeChannelId,
      learningObjectives: scenarioData.learningObjectives,
      name: scenarioData.name,
      description: scenarioData.description,
      advanced: scenarioData.advanced,
      topologyMap: scenarioData.topologyMap,
    },
  });

  console.log(`✅ Scenario saved`);

await prisma.curriculum.deleteMany({
    where: { scenarioId: scenario.id },
  });

  // Create new questions with multiple skill categories
  for (const question of scenarioData.questions) {
    // Create curriculum
    const curriculum = await prisma.curriculum.create({
      data: {
        id: question.id,
        title: question.title,
        placeholder: question.placeholder,
        validation: question.validation,
        answer: question.answer,
        pointValue: question.pointValue,
        scenarioId: scenario.id,
      },
    });

    // Add skill categories
    for (const categoryKey of question.skillCategories) {
      const skillCategory = await prisma.skillCategory.findUnique({
        where: { key: categoryKey },
      });

      if (skillCategory) {
        await prisma.curriculumSkillCategory.create({
          data: {
            curriculumId: curriculum.id,
            skillCategoryId: skillCategory.id,
          },
        });
      }
    }
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
    description: `# (U) OPERATION MOLASSES MAZE (OMM)
## (U) Narrative
(U) LOCAL has for many years conducted successful clandestine operations within the city limits of
JERICHO. However, as JERICHO's counter-intelligence capabilities have grown increasingly adept at
detection and disruption, LOCAL must now secure additional safeguards for its operatives within the
area. To address this, LOCAL has sanctioned an offensive cyberspace operation to assess its
potential for kinetic impacts on a specific target network. Codenamed MOLASSES MAZE, this
operation has been entrusted to LOCAL leadership, who are granted tactical discretion to execute
the mission.
## (U) Target
(U) The mission target is JDOT, the Jericho Department Of Transportation. Gain initial access
to JDOT's network through their website at http://jericho-transportation.gov.je.
## (U) Objective
(U) Traffic control infrastructure is built and maintained by JDOT. Infrastructure control is
centralized for ease of management, meaning it is possible to manipulate all city traffic lights from
one location. LOCAL CYBER is to access the traffic light controls and demonstrate such capability by
causing severe traffic jams for the JERICHO populus at large. This will serve to demonstrate to LOCAL
COMMAND that operatives inside the city may use this to their advantage during infil to and exfil from
their operations.
## (U) Strategy
(U) Penetrate the JDOT network via the JDOT website mentioned above. Pivot and escalate privileges
inside the network to gain access to traffic control infrastructure by whatever means possible and
practical. Use your access to manipulate the traffic control infrastructure to cause as much chaos
as possible.
## (U) Intelligence
(U) External enumeration of JDOT's attack surface revealed a promising endpoint which will be
relayed once the operation is underway. Full compromise of the target environment may or may not 
be necessary to affect traffic flow, but to maintain persistence inside the network, it is highly
advised to elevate your privileges as highly as practical. Visible effect on target should only be
attempted once persistence is established. 

//SIGNED//
HEC7WE*KERQE
LOCAL COMMAND`,
    advanced: "Advanced settings and configurations will go here.",
    youtubeChannelId: "UCpIkfL-IyAxGNp4qR52zOFg",
    learningObjectives: `# Learning Objectives
Through completing this lab, students will: 
1. Apply foundational host discovery and port scanning skills with Nmap
2. Identify web vulnerabilities and utilize JavaScript to conduct web scraping
3. Practice password spraying with Hydra
4. Learn about fundamental PHP web vulnerabilities and misconfigurations
5. Exploit a web application to gain access to the underlying server
6. Analyze firewall rules and attempt to circumvent them
7. Demonstrate real-world password attacks 
8. Perform lateral movement to pivot deeper into a target network
9. Discuss industry-standard authentication best practices
10. Determine a nation-state's potential objectives in hacking critical transportation infrastructure`,
    topologyMap: "/webapp/images/traffic-light-topology.png",
  questions: [
  {
    id: "q1-nmap-scan",
    title: "Scan the 10.2.11.0/24 IP range. Were you able to identify any other targets?",
    placeholder: "Yes/No",
    validation: "^(yes|no|y|n)$i",  // Accept all variations
    answer: "No",
    skillCategories: ["ENUMERATION"],
    pointValue: 10,
  },
  {
    id: "q2-vulnerable-page",
    title: "Central Command instructed you to exploit this website. What page of the web app is vulnerable?",
    placeholder: "/example.php",
    validation: "^\\/[a-z0-9_]+\\.php$",
    answer: "/login.php",
    skillCategories: ["WEB_EXPLOITATION"],
    pointValue: 15,
  },
  {
    id: "q3-user-list-page",
    title: "To exploit this page, you need to gather a list of potential users, then form a wordlist of potential usernames. What page of the web app will give you that information?",
    placeholder: "/example.php",
    validation: "^\\/[a-z0-9_]+\\.php$",
    answer: "/month.php",
    skillCategories: ["WEB_EXPLOITATION"],
    pointValue: 15,
  },
  {
    id: "q4-hydra-credentials",
    title: "Next, use Hydra to exploit the web app. What credentials gave you access?",
    placeholder: "username:password",
    validation: "^[\\w:]+$",  // Just check format, flexible matching handles the rest
    answer: "erikwilliams:dragon",
    skillCategories: ["WEB_EXPLOITATION"],
    pointValue: 20,
  },
  {
    id: "q5-shell-user",
    title: "Gain access to the underlying server by using a PHP web shell. What user did you gain access to?",
    placeholder: "alice",
    validation: "^[\\w-]+$",
    answer: "www-data",
    skillCategories: ["WEB_EXPLOITATION"],
    pointValue: 20,
  },
  {
    id: "q6-subnet-target",
    title: "Scan the 10.2.11.0/24 IP subnet from the web server. What target did you discover?",
    placeholder: "X.X.X.X",
    validation: "^\\d{1,3}(\\.\\d{1,3}){3}$",
    answer: "10.2.11.75",
    skillCategories: ["POST_EXPLOITATION","ENUMERATION"],
    pointValue: 15,
  },
  {
    id: "q7-firewall-reason",
    title: "Why were you unable to detect this machine in your initial Nmap scan?\na. The new machine's firewall drops traffic from unknown IPs\nb. The router is misconfigured\nc. The new machine has a bad internet connection\nd. An IDS (Intrusion Detection System) blocked your Kali's IP",
    placeholder: "a",
    validation: "^[a-d]$i",
    answer: "a",
    skillCategories: ["POST_EXPLOITATION","ENUMERATION"],
    pointValue: 10,
  },
  {
    id: "q8-open-ports",
    title: "What port(s) are open on the new machine?",
    placeholder: "139,445,1337",
    validation: "^\\d{1,5}(,\\s*\\d{1,5})*$",  // Allow spaces after commas
    answer: "22,80",
    skillCategories: ["POST_EXPLOITATION","ENUMERATION"],
    pointValue: 10,
  },
  {
    id: "q9-ssh-credentials",
    title: "What credentials did you use to connect to the new machine?",
    placeholder: "username:password",
    validation: "^[\\w:]+$",
    answer: "erikwilliams:dragon",
    skillCategories: ["POST_EXPLOITATION"],
    pointValue: 20,
  },
  {
    id: "q10-auth-best-practices",
    title: "What authentication best practices would have prevented you from doing this?\na. Disable password-based authentication in favor of SSH keys\nb. Limit SSH access to only allow users who need it\nc. Require MFA for SSH logins\nd. Any of the above",
    placeholder: "a",
    validation: "^[a-d]$i",
    answer: "d",
    skillCategories: ["POST_EXPLOITATION"],
    pointValue: 15,
  },
],
  };

  await upsertScenario(trafficLights);

  console.log("✅ All scenarios updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
