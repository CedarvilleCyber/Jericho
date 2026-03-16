"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function ChangePasswordForm() {
  const { data } = authClient.useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        setPasswordError(result.error.message || "Failed to change password");
      } else {
        setPasswordSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestReset = async () => {
    const email = data?.user?.email;
    if (!email) return;
    setResetMessage("");
    setResetLoading(true);
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (result.error) {
        setResetMessage(result.error.message || "Failed to send reset email");
      } else {
        setResetMessage(`A password reset link has been sent to ${email}.`);
      }
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-6">
        <h3 className="font-bold text-lg mb-1">Change Password</h3>
        <p className="text-sm text-base-content/60 mb-4">
          You must know your current password to change it.
        </p>
        <form onSubmit={handleChangePassword}>
          <div className="flex flex-col gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Current Password</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="password"
                placeholder="Your current password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.currentTarget.value)}
                disabled={passwordLoading}
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">New Password</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="password"
                placeholder="New password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                disabled={passwordLoading}
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Confirm New Password</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="password"
                placeholder="Confirm new password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                disabled={passwordLoading}
              />
            </label>

            {passwordError && (
              <p className="text-sm text-error">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-success">{passwordSuccess}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Change Password
              </button>
            </div>
          </div>
        </form>

        <div className="divider" />

        <p className="text-sm text-base-content/60">
          {"Don't know your current password? "}
          <button
            className="link text-sm"
            type="button"
            onClick={handleRequestReset}
            disabled={resetLoading}
          >
            {resetLoading && (
              <span className="loading loading-spinner loading-xs mr-1" />
            )}
            Send reset email
          </button>
        </p>
        {resetMessage && (
          <p className="text-sm text-base-content/60 mt-1">{resetMessage}</p>
        )}
      </div>
    </div>
  );
}
