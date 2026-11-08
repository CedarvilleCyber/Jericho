"use client";

import { archiveScenario, restoreScenario } from "@/app/admin/scenarios/actions";
import { IconArchive, IconArchiveOff } from "@tabler/icons-react";
import { useRef, useState, useTransition } from "react";

export default function ArchiveScenarioButton({
  scenarioId,
  scenarioName,
  archived,
}: {
  scenarioId: string;
  scenarioName: string;
  archived: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const archive = () => {
    setError("");
    startTransition(async () => {
      const result = await archiveScenario(scenarioId);
      if (result?.error) setError(result.error);
      else dialogRef.current?.close();
    });
  };

  const restore = () => {
    setError("");
    startTransition(async () => {
      const result = await restoreScenario(scenarioId);
      if (result?.error) setError(result.error);
    });
  };

  if (archived) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          className="btn btn-sm btn-ghost shrink-0"
          onClick={restore}
          disabled={pending}
        >
          {pending && <span className="loading loading-spinner loading-xs" />}
          <IconArchiveOff size={16} /> Restore
        </button>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <button
        className="btn btn-sm btn-ghost text-error shrink-0"
        onClick={() => dialogRef.current?.showModal()}
      >
        <IconArchive size={16} /> Archive
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Archive scenario?</h3>
          <p className="py-4">
            This hides <span className="font-semibold">{scenarioName}</span> from the
            site — its page, the leaderboard, and any lists. You can restore it anytime
            from the Archived section.
          </p>
          {error && <p className="mb-2 text-sm text-error">{error}</p>}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost" disabled={pending}>
                Cancel
              </button>
            </form>
            <button className="btn btn-error" onClick={archive} disabled={pending}>
              {pending && <span className="loading loading-spinner loading-xs" />}
              Archive
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
