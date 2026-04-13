import CreateScenarioButton from "@/components/admin/create-scenario-button";
import { ScenarioCard } from "@/components/admin/scenario-card";
import prisma from "@/lib/prisma";

export default async function ScenariosPage() {
  const scenarios = await prisma.scenario.findMany({
    include: {
      questions: {
        include: { section: true, hints: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      sections: { orderBy: { order: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col mt-3">
      <div className="mx-auto w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Scenarios</h2>
          <CreateScenarioButton />
        </div>
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
