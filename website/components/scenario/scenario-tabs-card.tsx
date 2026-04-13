"use client";

import { useState } from "react";
import Image from "next/image";
import { IconExternalLink } from "@tabler/icons-react";
import TopologyViewer from "./topology-viewer";
import QuestionsPanel from "./questions-panel";
import { Topology } from "@/lib/scenarios/topology-types";
import { Section, UserAnswer } from "@/app/generated/prisma/client";
import { QuestionWithSection } from "@/components/admin/scenario-types";

type Tab = "Details" | "Topology" | "Questions" | "Livestream";

export default function ScenarioTabsCard({
  description,
  topology,
  topologyURL,
  scenarioName,
  hintsUsed,
  userScenarioId,
  questions,
  sections,
  userAnswers,
  revealedHintIds,
  correctQuestionIds,
}: {
  description: string;
  topology?: Topology;
  topologyURL?: string;
  scenarioName: string;
  hintsUsed?: number;
  userScenarioId?: string;
  questions: QuestionWithSection[];
  sections: Section[];
  userAnswers: UserAnswer[];
  revealedHintIds: string[];
  correctQuestionIds: string[];
}) {
  const hasTopology = !!(topology || topologyURL);
  const hasQuestions = questions.length > 0;

  const allTabs: Tab[] = ["Details"];
  if (hasTopology) allTabs.push("Topology");
  if (hasQuestions) allTabs.push("Questions");
  allTabs.push("Livestream");

  const [active, setActive] = useState<Tab>("Details");

  return (
    <div className="card bg-base-100 border border-base-300 min-h-0 flex flex-col">
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 rounded-t-2xl px-4 pt-4">
        <div className="tabs tabs-bordered">
          {allTabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              className={`tab${active === tab ? " tab-active" : ""}`}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {active === "Details" && (
          <p className="whitespace-pre-wrap">{description}</p>
        )}

        {active === "Topology" && (
          <>
            {topology && hintsUsed !== undefined && userScenarioId ? (
              <TopologyViewer
                topology={topology}
                hintsUsed={hintsUsed}
                userScenarioId={userScenarioId}
              />
            ) : topologyURL ? (
              <Image
                src={topologyURL}
                alt={`${scenarioName} topology`}
                width={800}
                height={600}
              />
            ) : null}
          </>
        )}

        {active === "Questions" && (
          <QuestionsPanel
            questions={questions}
            sections={sections}
            userAnswers={userAnswers}
            revealedHintIds={revealedHintIds}
            correctQuestionIds={correctQuestionIds}
          />
        )}

        {active === "Livestream" && (
          <div className="flex flex-col gap-3">
            <p>Livestream coming soon!</p>
            <div className="flex justify-end">
              <button className="btn" disabled>
                <IconExternalLink className="mr-2" />
                Pop out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
