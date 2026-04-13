import { EditScenarioPage } from "@/components/admin/edit-scenario-page";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditScenarioRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const scenario = await prisma.scenario.findUnique({
    where: { id },
    include: {
      questions: {
        include: { section: true, hints: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      sections: { orderBy: { order: "asc" } },
    },
  });

  if (!scenario) notFound();

  return <EditScenarioPage scenario={scenario} />;
}
