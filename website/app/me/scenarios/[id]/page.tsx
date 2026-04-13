import AddExistingVMToScenarioPage from "@/components/scenario/add-existing-vm";
import QuestionsPanel from "@/components/scenario/questions-panel";
import TopologyViewer from "@/components/scenario/topology-viewer";
import PVEViewer from "@/components/view/pve-viewer";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseTopology } from "@/lib/scenarios/topology-types";
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
      questions: {
        include: {
          userAnswers: { where: { userId: session.user.id } },
          section: true,
          hints: {
            orderBy: { order: "asc" },
            include: { userHints: { where: { userId: session.user.id } } },
          },
        },
        orderBy: { order: "asc" },
      },
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });
  if (!scenario) {
    redirect("/me/scenarios");
  }

  const revealedHintIds = scenario.questions
    .flatMap((q) => q.hints)
    .filter(
      (h) =>
        ((h as typeof h & { userHints?: unknown[] }).userHints?.length ?? 0) > 0
    )
    .map((h) => h.id);

  return (
    <div className="mx-6 px-4 py-8">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/me/scenarios">My Scenarios</Link>
          </li>
          <li>{scenario.name}</li>
        </ul>
      </div>
      <h1 className="text-2xl font-bold mb-4">{scenario.name}</h1>
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <div className="tabs tabs-bordered">
              <input
                type="radio"
                name="scenario_tabs"
                role="tab"
                className="tab"
                aria-label="Details"
                defaultChecked
              />
              <div role="tabpanel" className="tab-content py-4">
                <p>{scenario.description}</p>
              </div>
              {(scenario.topology || scenario.topologyURL) && (
                <>
                  <input
                    type="radio"
                    name="scenario_tabs"
                    role="tab"
                    className="tab"
                    aria-label="Topology"
                  />
                  <div role="tabpanel" className="tab-content py-4">
                    {scenario.topology && scenario.userScenarios[0] ? (
                      <TopologyViewer
                        topology={parseTopology(scenario.topology)}
                        hintsUsed={scenario.userScenarios[0].hintsUsed}
                        userScenarioId={scenario.userScenarios[0].id}
                      />
                    ) : scenario.topologyURL ? (
                      <Image
                        src={scenario.topologyURL}
                        alt={`${scenario.name} topology`}
                        width={800}
                        height={600}
                      />
                    ) : null}
                  </div>
                </>
              )}
              {scenario.questions.length > 0 && (
                <>
                  <input
                    type="radio"
                    name="scenario_tabs"
                    role="tab"
                    className="tab"
                    aria-label="Questions"
                  />
                  <div role="tabpanel" className="tab-content">
                    <QuestionsPanel
                      questions={scenario.questions}
                      sections={scenario.sections}
                      userAnswers={scenario.questions.flatMap((q) => q.userAnswers)}
                      revealedHintIds={revealedHintIds}
                      correctQuestionIds={scenario.questions
                        .filter((q) => {
                          const ua = q.userAnswers[0];
                          if (!ua) return false;
                          if (q.type === "NUMERIC")
                            return parseFloat(ua.answer.trim()) === parseFloat(q.answer.trim());
                          if (q.answerIsRegex) {
                            try { return new RegExp(q.answer).test(ua.answer.trim()); } catch { return false; }
                          }
                          return ua.answer.trim() === q.answer.trim();
                        })
                        .map((q) => q.id)}
                    />
                  </div>
                </>
              )}
              <input
                type="radio"
                name="scenario_tabs"
                role="tab"
                className="tab"
                aria-label="Livestream"
              />
              <div role="tabpanel" className="tab-content py-4">
                <div className="flex flex-col gap-3">
                  <p>Livestream coming soon!</p>
                  <div className="flex justify-end">
                    <button className="btn" disabled>
                      <IconExternalLink className="mr-2" />
                      Pop out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            {scenario.userScenarios[0]?.vmId ? (
              <>
                <p className="mb-2 text-base-content/60">
                  Click on the preview below to launch the VM console.
                </p>
                {scenario.userScenarios[0].vm ? (
                  <PVEViewer vmId={scenario.userScenarios[0].vm?.proxmoxId} />
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-lg text-base-content/60">
                  You do not have a VM associated with this scenario.
                </p>
                <div className="flex gap-3">
                  <AddExistingVMToScenarioPage
                    scenarioId={scenario.id}
                    vms={prismaUser?.vms}
                  />
                  <button className="btn">
                    Request a new VM <IconExternalLink className="ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
