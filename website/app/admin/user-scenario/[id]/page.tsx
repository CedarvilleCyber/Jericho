import prisma from "@/lib/prisma";
import {
  Breadcrumbs,
  Container,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
} from "@mantine/core";
import Link from "next/link";
import UserScenarioVMEditor from "./vm-editor";

export default async function UserScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userScenario = await prisma.userScenario.findUnique({
    where: {
      id,
    },
    include: {
      scenario: true,
      vm: true,
      user: {
        include: { vms: true },
      },
    },
  });

  return (
    <Container size="lg">
      <Breadcrumbs mb="lg" mt="md">
        <Link href="/">Home</Link>
        <Link href="/admin">Admin</Link>
        <Text>
          {userScenario?.user.name} - {userScenario?.scenario.name}
        </Text>
      </Breadcrumbs>
      <Text size="xl" mb="md">
        {userScenario?.scenario.name} scenario for {userScenario?.user.name}
      </Text>
      <Tabs defaultValue="vms">
        <TabsList>
          <TabsTab value="vms">VMs</TabsTab>
          <TabsTab value="questions">Questions</TabsTab>
        </TabsList>
        <TabsPanel value="vms" p="sm">
          {userScenario && (
            <UserScenarioVMEditor
              userScenarioId={userScenario.id}
              currentVM={userScenario.vm}
              availableVMs={userScenario.user.vms}
            />
          )}
        </TabsPanel>
      </Tabs>
    </Container>
  );
}
