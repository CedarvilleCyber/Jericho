"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function ChangeEmailForm({
  currentEmail,
}: {
  currentEmail: string;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeMessage, setEmailChangeMessage] = useState("");
  const [emailChangeError, setEmailChangeError] = useState("");

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeError("");
    setEmailChangeMessage("");
    setEmailChangeLoading(true);
    try {
      const result = await authClient.changeEmail({
        newEmail,
        callbackURL: "/me",
      });
      if (result.error) {
        setEmailChangeError(
          result.error.message || "Failed to request email change",
        );
      } else {
        setEmailChangeMessage(
          `A verification link has been sent to ${newEmail}. Click it to confirm the change.`,
        );
        setNewEmail("");
      }
    } catch (err) {
      setEmailChangeError(
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      setEmailChangeLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-6">
        <h3 className="font-bold text-lg mb-1">Change Email</h3>
        <p className="text-sm text-base-content/60 mb-4">
          A verification link will be sent to your new address. Your email
          won&apos;t change until you click it.
        </p>
        <form onSubmit={handleChangeEmail}>
          <div className="flex flex-col gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Current Email</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="email"
                value={currentEmail}
                disabled
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">New Email</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="email"
                placeholder="New email address"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.currentTarget.value)}
                disabled={emailChangeLoading}
              />
            </label>
            {emailChangeError && (
              <p className="text-sm text-error">{emailChangeError}</p>
            )}
            {emailChangeMessage && (
              <p className="text-sm text-success">{emailChangeMessage}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={emailChangeLoading}
              >
                {emailChangeLoading && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Send Verification
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
