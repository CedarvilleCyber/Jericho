import CreateScenarioButton from "@/components/admin/create-scenario-button";
import { ScenarioCard } from "@/components/admin/scenario-card";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jericho | Manage Scenarios",
};

export default async function ScenariosPage() {
  const scenarios = await prisma.scenario.findMany({
    include: {
      questions: {
        include: { section: true, hints: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      sections: { orderBy: { order: "asc" } },
      livestreams: true,
    },
    orderBy: { name: "asc" },
  });
  const activeScenarios = scenarios.filter((s) => s.archivedAt === null);
  const archivedScenarios = scenarios.filter((s) => s.archivedAt !== null);

  return (
    <div className="flex flex-col mt-3">
      <div className="mx-auto w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Scenarios</h2>
          <CreateScenarioButton />
        </div>
        {activeScenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
        {archivedScenarios.length > 0 && (
          <details className="collapse collapse-arrow border border-base-300 bg-base-100 mt-8">
            <summary className="collapse-title text-lg font-semibold text-base-content/70">
              Archived ({archivedScenarios.length})
            </summary>
            <div className="collapse-content">
              {archivedScenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
