import ScenarioSelector from "@/components/leaderboard/scenario-selector";
import Leaderboard from "@/components/leaderboard/leaderboard";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  buildLeaderboardEntries,
  MACHINE_REVEAL_PENALTY,
  QUESTION_HINT_PENALTY,
} from "@/lib/scenarios/leaderboard";
import type { LeaderboardEntry } from "@/lib/scenarios/leaderboard";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jericho | Leaderboard",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const scenarios = await prisma.scenario.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const { scenario: scenarioId } = await searchParams;
  const selectedScenario = scenarioId
    ? scenarios.find((s) => s.id === scenarioId) ?? null
    : null;

  let leaderboard: LeaderboardEntry[] = [];

  if (selectedScenario) {
    const userScenarios = await prisma.userScenario.findMany({
      where: { scenarioId: selectedScenario.id },
      include: {
        user: {
          select: { id: true, name: true, displayUsername: true },
        },
      },
    });

    const userIds = userScenarios.map((us) => us.userId);

    const [questions, userHints] = await Promise.all([
      prisma.question.findMany({
        where: { scenarioId: selectedScenario.id },
        include: {
          userAnswers: { where: { userId: { in: userIds } } },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).userHint.findMany({
        where: {
          userId: { in: userIds },
          hint: { question: { scenarioId: selectedScenario.id } },
        },
        select: { userId: true },
      }) as Promise<{ userId: string }[]>,
    ]);

    leaderboard = buildLeaderboardEntries(userScenarios, questions, userHints);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>Leaderboard</li>
        </ul>
      </div>

      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      <div className="mb-6">
        <ScenarioSelector scenarios={scenarios} />
      </div>

      <Leaderboard
        entries={leaderboard}
        currentUserId={session.user.id}
        scenarioName={selectedScenario?.name ?? null}
        machineRevealPenalty={MACHINE_REVEAL_PENALTY}
        questionHintPenalty={QUESTION_HINT_PENALTY}
      />
    </div>
  );
}
