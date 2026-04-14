"use client";

import { useState } from "react";
import Image from "next/image";
import { IconExternalLink, IconPlayerPlay } from "@tabler/icons-react";
import TopologyViewer from "./topology-viewer";
import QuestionsPanel from "./questions-panel";
import { Topology } from "@/lib/scenarios/topology-types";
import { Section, UserAnswer } from "@/app/generated/prisma/client";
import { QuestionWithSection } from "@/components/admin/scenario-types";

type Tab = "Details" | "Topology" | "Questions" | "Livestream";

interface ScenarioLivestream {
  id: string;
  channelId: string;
  videoId?: string | null;
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

  const openLivestream = (livestream: ScenarioLivestream) => {
    // Always use videoId
    window.open(`https://www.youtube.com/watch?v=${livestream.videoId}`, "_blank");
  };

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
                  <div
                    key={livestream.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-700"
                  >
                    {/* Animated gradient border on hover */}
                    <div className="absolute -inset-0.5 -z-10 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 blur transition-opacity duration-300 group-hover:opacity-10" />

                    <div className="p-6">
                      {/* Header with title and live indicator */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            {livestream.label}
                          </h3>
                        </div>
                        <button
                          onClick={() => openLivestream(livestream)}
                          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40 dark:from-blue-500 dark:to-indigo-500"
                          aria-label={`Open ${livestream.label} in new window`}
                        >
                          <IconExternalLink size={16} />
                          <span className="hidden sm:inline">Open</span>
                        </button>
                      </div>

                      {/* Video embed container */}
                      <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-xl">
                        {/* 16:9 aspect ratio container */}
                        <div className="relative pt-[56.25%]">
                          <iframe
                            className="absolute inset-0 h-full w-full border-0"
                            src={`https://www.youtube.com/embed/${livestream.videoId}?modestbranding=1&rel=0`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={livestream.label}
                            loading="lazy"
                          />
                        </div>
                      </div>

                      {/* Optional: Show description or metadata */}
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Now playing
                        </span>
                      </div>
                    </div>
                  </div>
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