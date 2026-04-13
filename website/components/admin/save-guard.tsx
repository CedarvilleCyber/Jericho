"use client";

import { useRef } from "react";

interface DiscardConfirmDialogProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onDiscard: () => void;
  title?: string;
  body?: string;
}

function DiscardConfirmDialog({
  dialogRef,
  onDiscard,
  title = "Discard changes?",
  body = "Any unsaved changes will be lost.",
}: DiscardConfirmDialogProps) {
  function handleDiscard() {
    dialogRef.current?.close();
    onDiscard();
  }

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4 text-base-content/70">{body}</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>
            Keep editing
          </button>
          <button className="btn btn-error" onClick={handleDiscard}>
            Discard
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={() => dialogRef.current?.close()} />
    </dialog>
  );
}

export function useSaveGuard(
  onDiscard: () => void,
  options?: { title?: string; body?: string },
) {
  const confirmRef = useRef<HTMLDialogElement>(null);

  function handleCancelAttempt() {
    confirmRef.current?.showModal();
  }

  function handleDialogCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    handleCancelAttempt();
  }

  const confirmDialog = (
    <DiscardConfirmDialog
      dialogRef={confirmRef}
      onDiscard={onDiscard}
      title={options?.title}
      body={options?.body}
    />
  );

  return { handleCancelAttempt, handleDialogCancel, confirmDialog };
}
