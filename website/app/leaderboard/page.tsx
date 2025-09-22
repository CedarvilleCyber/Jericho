export default function LeaderboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      {(() => {
        const data = [
          { username: "Diana", points: 1120 },
          { username: "Charlie", points: 1560 },
          { username: "Alice", points: 1240 },
          { username: "Eve", points: 720 },
          { username: "Bob", points: 980 },
        ].sort((a, b) => b.points - a.points);

        return (
          <ol className="mt-4 rounded-lg border">
            {data.map((u, i) => (
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
        );
      })()}
    </div>
  );
}
