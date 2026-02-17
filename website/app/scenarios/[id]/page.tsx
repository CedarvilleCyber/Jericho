import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { joinScenario } from "@/lib/scenarios/join";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Group,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }
  const { id } = await params;
  const scenario = await prisma.scenario.findUnique({
    where: {
      id,
    },
  });
  const prismaUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      userScenarios: true,
    },
  });
  const alreadyJoined = prismaUser?.userScenarios.some(
    (us) => us.scenarioId === id,
  );

  return (
    <Container size="md" className="py-8">
      <Breadcrumbs mb="lg">
        <Link href="/">Home</Link>
        <Link href="/scenarios">Scenarios</Link>
        <Text>{scenario?.name || "Scenario Not Found"}</Text>
      </Breadcrumbs>
      <Group mb="md">
        {scenario?.teaserImageURL ? (
          <Image
            src={scenario?.teaserImageURL || "/default-scenario.png"}
            alt={scenario?.name || "Scenario Image"}
            width={64}
            height={64}
            className="rounded-md"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        <Title order={2}>{scenario?.name || "Scenario Not Found"}</Title>
      </Group>
      <Text size="md" c="dimmed">
        {scenario?.description ||
          "The scenario you are looking for does not exist."}
      </Text>
      {scenario && (
        <Group w="100%" justify="end">
          <form action={joinScenario}>
            <input type="hidden" name="userId" value={session.user.id} />
            <input type="hidden" name="scenarioId" value={id} />
            <Button
              variant="filled"
              mt="md"
              disabled={alreadyJoined}
              type="submit"
            >
              {alreadyJoined ? "Already Joined" : "Join Scenario"}
            </Button>
          </form>
        </Group>
      )}
    </Container>
  );
}
