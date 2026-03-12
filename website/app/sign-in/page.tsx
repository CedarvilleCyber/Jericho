"use client";

import { authClient } from "@/lib/auth-client";
import { requestPasswordResetByIdentifier } from "@/lib/password-reset/request";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (searchParams.get("mode") === "signup") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleRequestReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");
    await requestPasswordResetByIdentifier(resetIdentifier);
    setResetLoading(false);
    setResetMessage("If an account exists, a reset request has been submitted. Ask an admin to set a temporary password for you.");
    setResetIdentifier("");
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email,
          username,
          password,
          name,
        });

        if (result.error) {
          setError(result.error.message || "Failed to sign up");
        } else {
          router.push("/");
        }
      } else {
        const isEmail = emailOrUsername.includes("@");

        const result = isEmail
          ? await authClient.signIn.email({
              email: emailOrUsername,
              password,
            })
          : await authClient.signIn.username({
              username: emailOrUsername,
              password,
            });

        if (result.error) {
          setError(result.error.message || "Failed to sign in");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 flex min-h-screen items-center justify-center py-12">
      <div className="card bg-base-100 border border-base-300 shadow-md w-full">
        <div className="card-body p-6">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                {isSignUp ? "Create an Account" : "Welcome Back"}
              </h2>
              <p className="text-sm text-base-content/60">
                {isSignUp
                  ? "Sign up with your email and username to get started"
                  : "Sign in to your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                {isSignUp && (
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
                )}

                {isSignUp && (
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
                )}

                <label className="form-control">
                  <div className="label">
                    <span className="label-text">
                      {isSignUp ? "Email" : "Email or Username"}
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    placeholder={
                      isSignUp ? "Your email address" : "Your email or username"
                    }
                    type={isSignUp ? "email" : "text"}
                    required
                    value={isSignUp ? email : emailOrUsername}
                    onChange={(e) =>
                      isSignUp
                        ? setEmail(e.currentTarget.value)
                        : setEmailOrUsername(e.currentTarget.value)
                    }
                    disabled={loading}
                  />
                </label>

                <label className="form-control">
                  <div className="label">
                    <span className="label-text">Password</span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    type="password"
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    disabled={loading}
                  />
                </label>

                {error && <p className="text-sm text-error">{error}</p>}

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </form>

            {!isSignUp && !showResetForm && (
              <p className="text-xs text-base-content/50 text-center">
                Forgot your password?{" "}
                <button
                  type="button"
                  className="link"
                  onClick={() => setShowResetForm(true)}
                >
                  Request an admin reset.
                </button>
              </p>
            )}

            {!isSignUp && showResetForm && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-base-content/60 text-center">
                  Enter your email or username and an admin will set a temporary password for you.
                </p>
                {resetMessage ? (
                  <p className="text-xs text-base-content/60 text-center">{resetMessage}</p>
                ) : (
                  <form onSubmit={handleRequestReset} className="flex flex-col gap-2">
                    <input
                      className="input input-bordered input-sm w-full"
                      placeholder="Email or username"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.currentTarget.value)}
                      required
                      disabled={resetLoading}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm flex-1"
                        onClick={() => setShowResetForm(false)}
                        disabled={resetLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm flex-1"
                        disabled={resetLoading}
                      >
                        {resetLoading && <span className="loading loading-spinner loading-xs" />}
                        Submit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div className="flex justify-center gap-2">
              <p className="text-sm text-base-content/60">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </p>
              <button
                className="link text-sm"
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-sm mx-auto px-4 flex min-h-screen items-center justify-center py-12">
          <p>Loading...</p>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
