"use client";

import { useState } from "react";
import Image from "next/image";
import { IconPlayerPlay } from "@tabler/icons-react";
import FlvPlayer from "@/components/livestream/flv-player";
import TopologyViewer from "./topology-viewer";
import QuestionsPanel from "./questions-panel";
import { Topology } from "@/lib/scenarios/topology-types";
import { Section, UserAnswer } from "@/app/generated/prisma/client";
import { QuestionWithSection } from "@/components/admin/scenario-types";

type Tab = "Details" | "Topology" | "Questions" | "Livestream";

interface ScenarioLivestream {
  id: string;
  streamKey: string;
  label: string;
  order: number;
}

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
  livestreams = [],
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
  livestreams?: ScenarioLivestream[];
}) {
  const hasTopology = !!(topology || topologyURL);
  const hasQuestions = questions.length > 0;
  const hasLivestreams = livestreams.length > 0;

  const allTabs: Tab[] = ["Details"];
  if (hasTopology) allTabs.push("Topology");
  if (hasQuestions) allTabs.push("Questions");
  allTabs.push("Livestream");

  const [active, setActive] = useState<Tab>("Details");

  // Sort livestreams by order
  const sortedLivestreams = [...livestreams].sort((a, b) => a.order - b.order);

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
          <div className="space-y-6">
            {hasLivestreams ? (
              <>
                {sortedLivestreams.map((livestream) => (
                  <FlvPlayer
                    key={livestream.id}
                    streamKey={livestream.streamKey}
                    label={livestream.label}
                  />
                ))}
              </>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-8 py-16 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
                {/* Decorative gradient orb */}
                <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-transparent blur-3xl" />

                <div className="relative flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950 dark:to-indigo-950">
                    <IconPlayerPlay
                      size={40}
                      className="text-indigo-600 dark:text-indigo-400"
                      stroke={1.5}
                      fill="currentColor"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                      Livestreams Coming Soon
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Live streaming will begin during the event
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}