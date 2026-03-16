"use client";

import { resetPassword } from "@/lib/password-reset/admin";
import { useRef, useState } from "react";

export default function ResetPasswordButton({ userId }: { userId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState("");

  return (
    <>
      <div className="flex flex-col gap-2 p-4 bg-neutral rounded-lg">
        <label className="text-neutral-content">Password Reset</label>
        <div>
          <input
            className="input input-primary"
            placeholder="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            className="tooltip tooltip-primary"
            data-tip={!password || password.length < 8 ? "Password must be at least 8 characters long" : ""}
          >
            <button
              className="btn btn-error ml-2"
              onClick={() => {
                if (!password || password.length < 8) {
                  return;
                }
                dialogRef.current?.showModal();
              }}
              disabled={!password || password.length < 8}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Reset Password</h3>
          <p className="py-4">Are you sure you want to reset the password?</p>
          <div className="modal-action">
            <button className="btn" onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={() =>
                resetPassword(userId, password).then(() =>
                  dialogRef.current?.close(),
                )
              }
            >
              Reset
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
