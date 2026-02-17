import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Box, Breadcrumbs, Button, Card, Container, Group, SimpleGrid, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyScenarios() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }
  const prismaUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      userScenarios: {
        include: {
          scenario: true,
        },
      },
    },
  });

  return (
    <Container size="md" className="py-8">
      <Breadcrumbs mb="lg">
        <Link href="/">Home</Link>
        <Text>My Scenarios</Text>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4">My Scenarios</h1>
      <Text size="md" c="dimmed" mb="md">
        Click on a scenario to enter the lab
      </Text>
      <SimpleGrid cols={2} spacing="lg">
        {prismaUser?.userScenarios.map((us) => (
          <Link key={us.id} href={`/me/scenarios/${us.scenario.id}`}>
            <Card
              key={us.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="h-full transition-transform duration-200 hover:scale-[1.03]"
            >
              <Group>
                {us.scenario.teaserImageURL ? (
                  <Image
                    src={us.scenario.teaserImageURL}
                    alt={us.scenario.name}
                    width={48}
                    height={48}
                    className="mb-3 rounded-md"
                  />
                ) : null}
                <h2 className="text-xl font-semibold mb-2">
                  {us.scenario.name}
                </h2>
              </Group>
              <Text size="sm" c="dimmed" mb={"sm"}>
                Joined on {us.startedAt.toLocaleDateString()}
              </Text>
            </Card>
          </Link>
        ))}
      </SimpleGrid>
    </Container>
  );
}
