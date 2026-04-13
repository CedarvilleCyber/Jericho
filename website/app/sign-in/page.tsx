"use client";

import { authClient } from "@/lib/auth-client";
import { IconBrandWindows } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function RequiredMark() {
  return <span className="text-error ml-0.5">*</span>;
}

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const router = useRouter();

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");
    await authClient.requestPasswordReset({
      email: resetEmail,
      redirectTo: "/reset-password",
    });
    setResetLoading(false);
    // Always show the same message to avoid user enumeration
    setResetMessage(
      "If an account with that email exists, a reset link has been sent.",
    );
    setResetEmail("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email,
          username: username || undefined,
          password,
          name,
        });

        if (result.error) {
          setError(result.error.message || "Failed to sign up");
        } else {
          setSignUpEmail(email);
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

  const handleMicrosoftSignIn = async () => {
    setError("");
    setMicrosoftLoading(true);

    try {
      await authClient.signIn.social({
        provider: "microsoft",
        callbackURL: "/",
        errorCallbackURL: "/sign-in",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Microsoft",
      );
      setMicrosoftLoading(false);
    }
  };

  if (signUpEmail) {
    return (
      <div className="max-w-sm mx-auto px-4 flex min-h-screen items-center justify-center py-12">
        <div className="card bg-base-100 border border-base-300 shadow-md w-full">
          <div className="card-body p-6 text-center flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-sm text-base-content/60">
              We sent a verification link to{" "}
              <span className="font-medium text-base-content">
                {signUpEmail}
              </span>
              . Click it to activate your account.
            </p>
            <p className="text-xs text-base-content/40">
              Didn&apos;t get it? Check your spam folder.
            </p>
            <a href="/sign-in" className="btn btn-ghost btn-sm">
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    );
  }

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

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="btn btn-outline w-full"
                onClick={handleMicrosoftSignIn}
                disabled={loading || microsoftLoading}
              >
                {microsoftLoading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <IconBrandWindows size={18} />
                )}
                Continue with Microsoft
              </button>
              <div className="divider my-0 text-xs text-base-content/40">or</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                {isSignUp && (
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">
                        Name <RequiredMark />
                      </span>
                    </div>
                    <input
                      className="input input-bordered w-full"
                      placeholder="Your full name"
                      required
                      value={name}
                      onChange={(e) => setName(e.currentTarget.value)}
                      disabled={loading || microsoftLoading}
                    />
                  </label>
                )}

                {isSignUp && (
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Username</span>
                      <span className="label-text-alt text-base-content/30">
                        Optional
                      </span>
                    </div>
                    <input
                      className="input input-bordered w-full"
                      placeholder="Your username"
                      value={username}
                      onChange={(e) => setUsername(e.currentTarget.value)}
                      disabled={loading || microsoftLoading}
                    />
                  </label>
                )}

                <label className="form-control">
                  <div className="label">
                    <span className="label-text">
                      {isSignUp ? "Email" : "Email or Username"}{" "}
                      <RequiredMark />
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
                    disabled={loading || microsoftLoading}
                  />
                </label>

                <label className="form-control">
                  <div className="label">
                    <span className="label-text">
                      Password <RequiredMark />
                    </span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    type="password"
                    placeholder="Your password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    disabled={loading || microsoftLoading}
                  />
                </label>

                {isSignUp && (
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">
                        Confirm Password <RequiredMark />
                      </span>
                    </div>
                    <input
                      className="input input-bordered w-full"
                      type="password"
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.currentTarget.value)
                      }
                      disabled={loading || microsoftLoading}
                    />
                  </label>
                )}

                {error && <p className="text-sm text-error">{error}</p>}

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading || microsoftLoading}
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
                  Reset it via email.
                </button>
              </p>
            )}

            {!isSignUp && showResetForm && (
              <div className="flex flex-col gap-3">
                {resetMessage ? (
                  <p className="text-xs text-base-content/60 text-center">
                    {resetMessage}
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-base-content/60 text-center">
                      Enter your email and we&apos;ll send you a reset link.
                    </p>
                    <form
                      onSubmit={handleRequestReset}
                      className="flex flex-col gap-2"
                    >
                      <input
                        className="input input-bordered input-sm w-full"
                        type="email"
                        placeholder="Your email address"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.currentTarget.value)}
                        required
                        disabled={resetLoading || microsoftLoading}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm flex-1"
                          onClick={() => setShowResetForm(false)}
                          disabled={resetLoading || microsoftLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm flex-1"
                          disabled={resetLoading || microsoftLoading}
                        >
                          {resetLoading && (
                            <span className="loading loading-spinner loading-xs" />
                          )}
                          Send Link
                        </button>
                      </div>
                    </form>
                  </>
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
                  setConfirmPassword("");
                }}
                disabled={loading || microsoftLoading}
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
