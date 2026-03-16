"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileForm({
  initialName,
  initialUsername,
  email,
}: {
  initialName: string;
  initialUsername: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await authClient.updateUser({ name, username });
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

  return (
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
              <div className="label mt-1">
                <span className="label-text-alt">Change email below</span>
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
  );
}
