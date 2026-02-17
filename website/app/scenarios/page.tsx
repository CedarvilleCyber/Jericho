import prisma from "@/lib/prisma";
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  ThemeIcon,
  Text,
  Breadcrumbs,
} from "@mantine/core";
import { IconDeviceDesktop } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default async function ScenariosPage() {
  const scenarios = await prisma.scenario.findMany();

  return (
    <Container size="md" className="py-8">
      <Breadcrumbs mb="lg">
        <Link href="/">Home</Link>
        <Text>Scenarios</Text>
      </Breadcrumbs>
      <Title order={2} style={{ marginBottom: "1rem" }}>
        Available Scenarios
      </Title>
      <SimpleGrid cols={2} spacing="lg">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/scenarios/${scenario.id}`}
            className="no-underline"
          >
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="h-full transition-transform duration-200 hover:scale-[1.03]"
            >
              {scenario.teaserImageURL ? (
                <Image
                  src={scenario.teaserImageURL}
                  alt={scenario.name}
                  width={48}
                  height={48}
                  className="mb-3 rounded-md"
                />
              ) : (
                <ThemeIcon
                  size={48}
                  radius="md"
                  variant="light"
                  color="blue"
                  className="mb-3"
                >
                  <IconDeviceDesktop size={24} />
                </ThemeIcon>
              )}
              <Title order={4} className="mb-2" mb={"xs"}>
                {scenario.name}
              </Title>
              <Text size="sm" c="dimmed">
                {scenario.teaserText || "No description available."}
              </Text>
            </Card>
          </Link>
        ))}
      </SimpleGrid>
    </Container>
  );
}
