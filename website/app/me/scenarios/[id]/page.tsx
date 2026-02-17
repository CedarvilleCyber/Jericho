import AddExistingVMToScenarioPage from "@/components/scenario/add-existing-vm";
import PVEViewer from "@/components/view/pve-viewer";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Breadcrumbs,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ScenarioLabPage({
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
  const prismaUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      vms: true,
    },
  });
  const { id } = await params;
  const scenario = await prisma.scenario.findUnique({
    where: {
      id,
    },
    include: {
      userScenarios: {
        where: { userId: session.user.id },
        include: { vm: true },
      },
      questions: true,
    },
  });
  if (!scenario) {
    redirect("/me/scenarios");
  }

  return (
    <Container size="lg" className="py-8">
      <Breadcrumbs mb="lg">
        <Link href="/">Home</Link>
        <Link href="/me/scenarios">My Scenarios</Link>
        <Text>{scenario.name}</Text>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4">{scenario.name}</h1>
      <SimpleGrid cols={2} spacing="lg" mb="md">
        <Card>
          <Tabs defaultValue="details">
            <TabsList mb="md">
              <TabsTab value="details">Details</TabsTab>
              {scenario.topologyURL && (
                <TabsTab value="topology">Topology</TabsTab>
              )}
              {scenario.questions.length > 0 && (
                <TabsTab value="questions">Questions</TabsTab>
              )}
              <TabsTab value="livestream">Livestream</TabsTab>
            </TabsList>
            <TabsPanel value="details">
              <Text>{scenario.description}</Text>
            </TabsPanel>
            {scenario.topologyURL && (
              <TabsPanel value="topology">
                <Image
                  src={scenario.topologyURL}
                  alt={`${scenario.name} topology`}
                  width={800}
                  height={600}
                />
              </TabsPanel>
            )}
            {scenario.questions.length > 0 && (
              <TabsPanel value="questions">
                <></>
              </TabsPanel>
            )}
            <TabsPanel value="livestream">
              <Stack>
                <Text>Livestream coming soon!</Text>
                <Group justify="end">
                  <Button disabled>
                    <IconExternalLink className="mr-2" />
                    Pop out
                  </Button>
                </Group>
              </Stack>
            </TabsPanel>
          </Tabs>
        </Card>
        <Card>
          {scenario.userScenarios[0]?.vmId ? (
            <>
              <Text mb="xs" c="dimmed">
                Click on the preview below to launch the VM console.
              </Text>
              {scenario.userScenarios[0].vm ? (
                <PVEViewer vmId={scenario.userScenarios[0].vm?.proxmoxId} />
              ) : null}
            </>
          ) : (
            <Stack align="center" justify="center" className="h-full">
              <Text size="lg" c="dimmed">
                You do not have a VM associated with this scenario.
              </Text>
              <Group>
                <AddExistingVMToScenarioPage
                  scenarioId={scenario.id}
                  vms={prismaUser?.vms}
                />
                <Button>
                  Request a new VM <IconExternalLink className="ml-2" />
                </Button>
              </Group>
            </Stack>
          )}
        </Card>
      </SimpleGrid>
    </Container>
  );
}
