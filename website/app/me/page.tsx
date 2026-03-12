"use client";

import { authClient } from "@/lib/auth-client";
import { requestPasswordReset } from "@/lib/password-reset/request";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MePage() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    if (!isPending && !data?.session) {
      router.push("/sign-in");
    }

    if (data?.user) {
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setUsername(data.user.username || "");
    }
  }, [data, isPending, router]);

  const handleChangePassword = async (e: React.SubmitEvent) => {
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
      setPasswordError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setResetMessage("");
    const result = await requestPasswordReset();
    if (result.error) {
      setResetMessage(result.error);
    } else {
      setResetMessage(
        "Reset request submitted. An admin will set a temporary password for you."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await authClient.updateUser({
        name,
        username,
      });

      if (result.error) {
        setError(result.error.message || "Failed to update profile");
      } else {
        setSuccess("Profile updated successfully!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div
          className="flex flex-col justify-center items-center"
          style={{ minHeight: "50vh" }}
        >
          <span className="loading loading-spinner loading-xl" />
        </div>
      </div>
    );
  }

  if (!data?.session) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>My Profile</li>
        </ul>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Profile</h2>
          <p className="text-sm text-base-content/60">
            Update your account information
          </p>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <label className="form-control">
                  <div className="label">
                    <span className="label-text">Name</span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    placeholder="Your full name"
                    required
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    disabled={loading}
                  />
                </label>

                <label className="form-control">
                  <div className="label">
                    <span className="label-text">Username</span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    placeholder="Your username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    disabled={loading}
                  />
                </label>

                <label className="form-control">
                  <div className="label">
                    <span className="label-text">Email</span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    placeholder="Your email address"
                    type="email"
                    value={email}
                    disabled
                  />
                  <div className="label">
                    <span className="label-text-alt">
                      Email cannot be changed
                    </span>
                  </div>
                </label>

                {error && <p className="text-sm text-error">{error}</p>}
                {success && <p className="text-sm text-success">{success}</p>}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => router.push("/")}
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
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

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
              >
                Request admin reset
              </button>
            </p>
            {resetMessage && (
              <p className="text-sm text-base-content/60 mt-1">{resetMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
