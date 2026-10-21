import { IconTrophy } from "@tabler/icons-react";
import type { LeaderboardEntry } from "@/lib/scenarios/leaderboard";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  scenarioName: string | null;
  machineRevealPenalty: number;
  questionHintPenalty: number;
}

export default function Leaderboard({
  entries,
  currentUserId,
  scenarioName,
  machineRevealPenalty,
  questionHintPenalty,
}: LeaderboardProps) {
  if (!scenarioName) {
    return (
      <p className="text-base-content/60">
        Select a scenario above to view its leaderboard.
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-base-content/60">
        No participants yet for <strong>{scenarioName}</strong>.
      </p>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">{scenarioName}</h2>
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
            {entries.map((entry) => (
              <tr
                key={entry.userId}
                className={entry.userId === currentUserId ? "bg-primary/10" : ""}
              >
                <td>
                  {entry.rank === 1 ? (
                    <span className="badge badge-warning gap-1">
                      <IconTrophy size={12} />1
                    </span>
                  ) : (
                    <span className="text-base-content/60">{entry.rank}</span>
                  )}
                </td>
                <td>
                  <span className="font-medium">{entry.displayName}</span>
                  {entry.userId === currentUserId && (
                    <span className="badge badge-ghost badge-sm ml-2">you</span>
                  )}
                </td>
                <td className="text-right">{entry.rawScore}</td>
                <td className="text-right">
                  {entry.machinesRevealed > 0 ? (
                    <span className="text-warning">
                      {entry.machinesRevealed}
                    </span>
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
                <td className="text-right font-semibold">{entry.finalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-base-content/40 mt-2">
        Final = Score − (Machines × {machineRevealPenalty} pts) − (Q. Hints ×{" "}
        {questionHintPenalty} pts)
      </p>
    </>
  );
}
