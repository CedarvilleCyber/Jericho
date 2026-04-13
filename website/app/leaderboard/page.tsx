import ScenarioSelector from "@/components/leaderboard/scenario-selector";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { IconTrophy } from "@tabler/icons-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const MACHINE_REVEAL_PENALTY = 5;
const QUESTION_HINT_PENALTY = 2;

function isAnswerCorrect(
  userAnswer: string,
  correctAnswer: string,
  type: string,
  answerIsRegex: boolean
): boolean {
  const ua = userAnswer.trim();
  const ca = correctAnswer.trim();
  if (type === "NUMERIC") {
    return parseFloat(ua) === parseFloat(ca);
  }
  if (answerIsRegex) {
    try {
      return new RegExp(ca).test(ua);
    } catch {
      return false;
    }
  }
  return ua === ca;
}

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

  let leaderboard: {
    rank: number;
    userId: string;
    displayName: string;
    rawScore: number;
    machinesRevealed: number;
    questionHints: number;
    finalScore: number;
  }[] = [];

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

    // Count question hints per user
    const questionHintsByUser: Record<string, number> = {};
    for (const uh of userHints) {
      questionHintsByUser[uh.userId] = (questionHintsByUser[uh.userId] ?? 0) + 1;
    }

    const entries = userScenarios.map((us) => {
      const rawScore = questions.reduce((total, q) => {
        const ua = q.userAnswers.find((a) => a.userId === us.userId);
        if (!ua) return total;
        return isAnswerCorrect(ua.answer, q.answer, q.type, q.answerIsRegex)
          ? total + q.pointValue
          : total;
      }, 0);

      const machinesRevealed = us.hintsUsed;
      const questionHints = questionHintsByUser[us.userId] ?? 0;
      const finalScore =
        rawScore -
        machinesRevealed * MACHINE_REVEAL_PENALTY -
        questionHints * QUESTION_HINT_PENALTY;
      const displayName = us.user.displayUsername ?? us.user.name ?? "Unknown";

      return {
        userId: us.userId,
        displayName,
        rawScore,
        machinesRevealed,
        questionHints,
        finalScore,
      };
    });

    entries.sort(
      (a, b) =>
        b.finalScore - a.finalScore ||
        b.rawScore - a.rawScore ||
        a.machinesRevealed + a.questionHints - (b.machinesRevealed + b.questionHints)
    );

    leaderboard = entries.map((e, i) => ({ rank: i + 1, ...e }));
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

      {!selectedScenario ? (
        <p className="text-base-content/60">
          Select a scenario above to view its leaderboard.
        </p>
      ) : leaderboard.length === 0 ? (
        <p className="text-base-content/60">
          No participants yet for <strong>{selectedScenario.name}</strong>.
        </p>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-3">{selectedScenario.name}</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th className="text-right">Score</th>
                  <th className="text-right">Machines</th>
                  <th className="text-right">Q. Hints</th>
                  <th className="text-right">Final</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={
                      entry.userId === session.user.id ? "bg-primary/10" : ""
                    }
                  >
                    <td>
                      {entry.rank === 1 ? (
                        <span className="badge badge-warning gap-1">
                          <IconTrophy size={12} />1
                        </span>
                      ) : (
                        <span className="text-base-content/60">
                          {entry.rank}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="font-medium">{entry.displayName}</span>
                      {entry.userId === session.user.id && (
                        <span className="badge badge-ghost badge-sm ml-2">
                          you
                        </span>
                      )}
                    </td>
                    <td className="text-right">{entry.rawScore}</td>
                    <td className="text-right">
                      {entry.machinesRevealed > 0 ? (
                        <span className="text-warning">{entry.machinesRevealed}</span>
                      ) : (
                        entry.machinesRevealed
                      )}
                    </td>
                    <td className="text-right">
                      {entry.questionHints > 0 ? (
                        <span className="text-warning">{entry.questionHints}</span>
                      ) : (
                        entry.questionHints
                      )}
                    </td>
                    <td className="text-right font-semibold">
                      {entry.finalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-base-content/40 mt-2">
            Final = Score − (Machines × {MACHINE_REVEAL_PENALTY} pts) − (Q. Hints × {QUESTION_HINT_PENALTY} pts)
          </p>
        </>
      )}
    </div>
  );
}
