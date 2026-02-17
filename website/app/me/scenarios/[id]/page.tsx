import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Breadcrumbs, Container, Tabs, TabsList, TabsPanel, TabsTab, Text } from "@mantine/core";
import { headers } from "next/headers";
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
  const { id } = await params;
  const scenario = await prisma.scenario.findUnique({
    where: {
      id,
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
      <Tabs defaultValue="details">
        <TabsList mb="md">
          <TabsTab value="details">Details</TabsTab>
          <TabsTab value="topology">Topology</TabsTab>
          <TabsTab value="questions">Questions</TabsTab>
          <TabsTab value="livestream">Livestream</TabsTab>
        </TabsList>
        <TabsPanel value="details">
          <Text>{scenario.description}</Text>
        </TabsPanel>
      </Tabs>
    </Container>
  );
}
