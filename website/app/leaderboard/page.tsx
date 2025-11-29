import { prisma } from "@/prisma";
import UserStats from "@/components/leaderboard/user-stats";

export default async function LeaderboardPage() {
  // Fetch all users with their correct answers
  const users = await prisma.user.findMany({
    include: {
      userAnswers: {
        where: { isCorrect: true },
        include: { curriculum: { select: { pointValue: true } } },
      },
    },
  });

  // Calculate total points and latest completion time for each user
  const leaderboard = users
    .map((user) => {
      const points = user.userAnswers.reduce((sum, answer) => sum + answer.curriculum.pointValue, 0);
      // Get the latest timestamp (when they completed their last answer)
      const latestCompletion = user.userAnswers.length > 0 
        ? new Date(Math.max(...user.userAnswers.map((a) => new Date(a.updatedAt).getTime())))
        : new Date();

      return {
        username: user.name || user.email || "Unknown",
        points,
        latestCompletion,
      };
    })
    .filter((user) => user.points > 0) // Only show users with points
    .sort((a, b) => {
      // Sort by points descending first
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // If points are equal, sort by completion time (earlier = ranked higher)
      return a.latestCompletion.getTime() - b.latestCompletion.getTime();
    });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      
      <UserStats />

      <h2 className="text-xl font-semibold mb-4">Rankings</h2>
      {leaderboard.length === 0 ? (
        <p className="text-muted-foreground">No completed scenarios yet</p>
      ) : (
        <ol className="rounded-lg border">
          {leaderboard.map((u, i) => (
            <li
              key={u.username}
              className="flex items-center justify-between p-3 mx-1 my-2 border border-border rounded-2xl bg-popover"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 text-right font-mono text-sm text-gray-500">
                  #{i + 1}
                </span>
                <span className="font-medium">{u.username}</span>
              </div>
              <span className="font-semibold">
                {u.points.toLocaleString()} pts
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
