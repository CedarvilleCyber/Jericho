"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-error mb-4">Invalid or missing reset token.</p>
        <a href="/sign-in" className="link text-sm">
          Back to sign in
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) {
        setError(result.error.message || "Failed to reset password");
      } else {
        router.push("/sign-in");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
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
            disabled={loading}
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
            disabled={loading}
          />
        </label>

        {error && <p className="text-sm text-error">{error}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-xs" />}
          Set New Password
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-sm mx-auto px-4 flex min-h-screen items-center justify-center py-12">
      <div className="card bg-base-100 border border-base-300 shadow-md w-full">
        <div className="card-body p-6">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
              <p className="text-sm text-base-content/60">
                Enter your new password below.
              </p>
            </div>
            <Suspense fallback={<span className="loading loading-spinner loading-sm mx-auto" />}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
