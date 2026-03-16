"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function DeleteAccountSection() {
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const result = await authClient.deleteUser({
        password: deletePassword || undefined,
        callbackURL: "/sign-in",
      });
      if (result.error) {
        setDeleteError(result.error.message || "Failed to delete account");
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-6">
        <h3 className="font-bold text-lg mb-1 text-error">Delete Account</h3>
        <p className="text-sm text-base-content/60 mb-4">
          Permanently delete your account and all associated data. This cannot
          be undone.
        </p>
        {!showDeleteConfirm ? (
          <div className="flex justify-end">
            <button
              className="btn btn-error btn-outline btn-sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete My Account
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Confirm with your password</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="password"
                placeholder="Your current password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.currentTarget.value)}
                disabled={deleteLoading}
              />
            </label>
            {deleteError && <p className="text-sm text-error">{deleteError}</p>}
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Permanently Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
