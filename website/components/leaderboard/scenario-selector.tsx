"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ScenarioOption {
  id: string;
  name: string;
}

export default function ScenarioSelector({
  scenarios,
}: {
  scenarios: ScenarioOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("scenario") ?? "";

  return (
    <select
      className="select select-bordered w-full max-w-xs"
      value={current}
      onChange={(e) => {
        if (e.target.value) {
          router.push(`/leaderboard?scenario=${e.target.value}`);
        } else {
          router.push("/leaderboard");
        }
      }}
    >
      <option value="">— Select a scenario —</option>
      {scenarios.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
