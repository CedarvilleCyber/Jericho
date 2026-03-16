"use client";

import { authClient } from "@/lib/auth-client";
import { requestPasswordReset } from "@/lib/password-reset/request";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Session = {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
};

function parseUserAgent(ua: string): string {
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" :
    "Unknown browser";

  const os =
    /Windows NT 10/.test(ua) ? "Windows 10/11" :
    /Windows NT 6\.3/.test(ua) ? "Windows 8.1" :
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" :
    "Unknown OS";

  return `${browser} on ${os}`;
}

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

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokeAllLoading, setRevokeAllLoading] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeMessage, setEmailChangeMessage] = useState("");
  const [emailChangeError, setEmailChangeError] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const result = await authClient.listSessions();
      if (result.data) {
        setSessions(result.data as Session[]);
      }
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (token: string) => {
    await authClient.revokeSession({ token });
    await loadSessions();
  };

  const handleRevokeOtherSessions = async () => {
    setRevokeAllLoading(true);
    try {
      await authClient.revokeOtherSessions();
      await loadSessions();
    } finally {
      setRevokeAllLoading(false);
    }
  };

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
        setEmailChangeError(result.error.message || "Failed to request email change");
      } else {
        setEmailChangeMessage(
          `A verification link has been sent to ${newEmail}. Click it to confirm the change.`
        );
        setNewEmail("");
      }
    } catch (err) {
      setEmailChangeError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setEmailChangeLoading(false);
    }
  };

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

  useEffect(() => {
    if (!isPending && !data?.session) {
      router.push("/sign-in");
    }

    if (data?.user) {
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setUsername(data.user.username || "");
    }

    if (data?.session) {
      loadSessions();
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
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg">Active Sessions</h3>
              <button
                className="btn btn-ghost btn-sm text-error"
                onClick={handleRevokeOtherSessions}
                disabled={revokeAllLoading || sessions.length <= 1}
              >
                {revokeAllLoading && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Revoke All Others
              </button>
            </div>
            <p className="text-sm text-base-content/60 mb-4">
              Manage devices and sessions with access to your account.
            </p>
            {sessionsLoading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sessions.map((session) => {
                  const isCurrent = session.token === data.session.token;
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between py-2 border-b border-base-200 last:border-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {session.userAgent
                              ? parseUserAgent(session.userAgent)
                              : "Unknown device"}
                          </span>
                          {isCurrent && (
                            <span className="badge badge-primary badge-sm">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-base-content/50">
                          {session.ipAddress ?? "Unknown IP"} &middot;{" "}
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!isCurrent && (
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleRevokeSession(session.token)}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                    value={email}
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

        <div className="card bg-base-100 border border-base-300 border-error/30 shadow-sm">
          <div className="card-body p-6">
            <h3 className="font-bold text-lg mb-1 text-error">
              Delete Account
            </h3>
            <p className="text-sm text-base-content/60 mb-4">
              Permanently delete your account and all associated data. This
              cannot be undone.
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
                    <span className="label-text">
                      Confirm with your password
                    </span>
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
                {deleteError && (
                  <p className="text-sm text-error">{deleteError}</p>
                )}
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
      </div>
    </div>
  );
}
