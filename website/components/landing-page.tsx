import {
  Button,
  Card,
  Container,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import TrafficLight from "@/public/traffic-light.png";
import WaterTreatment from "@/public/water-treatment.png";
import NuclearPlant from "@/public/nuclear-plant.png";

export function LandingPage() {
  const scenarios = [
    {
      title: "Traffic Light",
      image: TrafficLight,
      description:
        "You've found a website for your local traffic advisory and light control system. This website looks like it could be vulnerable to some clever attacks. Build your skills in web exploitation and white-hat hacking with this fun entry-level scenario.",
      href: "/scenarios/traffic-light",
    },
    {
      title: "Water Treatment",
      image: WaterTreatment,
      description:
        "Dive into the critical infrastructure of water treatment systems. Learn about SCADA security, industrial control systems, and the challenges of protecting essential utilities from cyber threats.",
      href: "/scenarios/water-treatment",
    },
    {
      title: "Nuclear Plant",
      image: NuclearPlant,
      description:
        "Explore the high-stakes world of nuclear facility security. Understand the complex layers of protection, safety systems, and cybersecurity measures that keep critical nuclear infrastructure secure.",
      href: "/scenarios/nuclear-plant",
    },
  ];

  return (
    <Container size="lg" className="py-12 pb-24">
      {/* Header */}
      <Card className="mb-6" shadow="md" padding="xl" radius="md" withBorder>
        <Title order={1} className="text-4xl font-bold mb-4">
          Explore Scenarios
        </Title>
        <Text size="lg" c="dimmed" className="mb-6 max-w-2xl">
          Hands-on cyber-physical infrastructure scenarios for learning and
          experimentation. Sign up to get started with interactive labs.
        </Text>
      </Card>

      {/* Scenarios Grid */}
      <Stack gap="lg">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.title}
            shadow="md"
            padding="xl"
            radius="md"
            withBorder
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <Image
                  src={scenario.image}
                  alt={scenario.title}
                  width={256}
                  height={256}
                  className="rounded-lg shadow-lg w-64 h-64 object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between gap-4">
                <div>
                  <Title order={2} className="text-2xl font-semibold mb-3">
                    {scenario.title}
                  </Title>
                  <Text size="md" className="leading-relaxed">
                    {scenario.description}
                  </Text>
                </div>
                <div className="flex gap-3">
                  <Link href="/sign-in?mode=signup">
                    <Button
                      variant="filled"
                      size="md"
                      rightSection={<IconArrowRight size={18} />}
                    >
                      Sign Up to Get Started
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="subtle" size="md">
                      Already have an account?
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
