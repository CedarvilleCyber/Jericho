"use client";

import { resolvePasswordReset } from "@/lib/password-reset/resolve";
import { IconKey } from "@tabler/icons-react";
import { useRef, useState } from "react";

export default function ResolvePasswordResetButton({
  requestId,
  userName,
}: {
  requestId: string;
  userName: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function open() {
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
    setNewPassword("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await resolvePasswordReset(requestId, newPassword);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      close();
    }
  }

  return (
    <>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            type="button"
            onClick={close}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-3">
            Set Temporary Password for {userName}
          </h3>
          <hr className="mb-3" />
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Temporary Password</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  placeholder="Enter temporary password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.currentTarget.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/60">
                    Communicate this password to the user securely.
                  </span>
                </div>
              </label>

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={close}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  Set Password
                </button>
              </div>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={close}>close</button>
        </form>
      </dialog>

      <button className="btn btn-warning btn-sm" type="button" onClick={open}>
        <IconKey size={16} />
        Set Password
      </button>
    </>
  );
}
