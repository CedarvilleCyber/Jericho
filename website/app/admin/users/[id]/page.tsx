import AddExistingScenarioPage from "@/components/scenario/add-existing-scenario";
import EditUserScenario from "@/components/scenario/edit-user-scenario";
import prisma from "@/lib/prisma";
import { deleteUserScenario } from "@/lib/scenarios/delete";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      userScenarios: { include: { scenario: true } },
      vms: true,
    },
  });
  const allScenarios = (await prisma.scenario.findMany()).map((scenario) => ({
    ...scenario,
    joined:
      user?.userScenarios.some((us) => us.scenarioId === scenario.id) ?? false,
  }));
  if (!user) {
    redirect("/admin");
  }

  return (
    <Container size="lg" mt="md">
      <Breadcrumbs mb="md">
        <Link href="/">Home</Link>
        <Link href="/admin">Admin</Link>
        <span>{user?.name}</span>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTab value="details">Details</TabsTab>
          <TabsTab value="vms">VMs</TabsTab>
          <TabsTab value="scenarios">Scenarios</TabsTab>
        </TabsList>
        <TabsPanel value="scenarios" p="sm">
          <Text size="lg" mb="sm">
            Scenarios for {user?.name}
          </Text>
          <Stack>
            {user?.userScenarios.map((us) => (
              <Card key={us.id} withBorder>
                <Group>
                  <Stack gap="xs" mr="auto">
                    <Group>
                      <Image
                        src={us.scenario.teaserImageURL ?? "/placeholder.png"}
                        alt={us.scenario.name}
                        width={48}
                        height={48}
                        className="mb-3 rounded-md"
                      />
                      <Text size="lg">{us.scenario.name}</Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Added on {us.startedAt.toLocaleDateString()}
                    </Text>
                  </Stack>
                  <EditUserScenario userScenarioId={us.id} />
                  <form action={deleteUserScenario}>
                    <input type="hidden" name="userScenarioId" value={us.id} />
                    <Button color="red" type="submit">
                      <IconTrash size={16} className="mr-2" />
                      Delete
                    </Button>
                  </form>
                </Group>
              </Card>
            ))}
            <Group justify="end">
              <AddExistingScenarioPage
                userId={user.id}
                scenarios={allScenarios}
              />
            </Group>
          </Stack>
        </TabsPanel>
      </Tabs>
    </Container>
  );
}
