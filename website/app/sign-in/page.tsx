"use client";

import { authClient } from "@/lib/auth-client";
import {
  Anchor,
  Button,
  Card,
  Container,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check if mode=signup is in URL
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up with email and username
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
        // Sign in with email or username
        // Detect if input is email or username based on @ symbol
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
    <Container size="xs" className="flex min-h-screen items-center justify-center py-12">
      <Card shadow="md" padding="xl" radius="md" withBorder className="w-full">
        <Stack gap="lg">
          <div className="text-center">
            <Title order={2} className="mb-2">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </Title>
            <Text size="sm" c="dimmed">
              {isSignUp
                ? "Sign up with your email and username to get started"
                : "Sign in to your account"}
            </Text>
          </div>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {isSignUp && (
                <TextInput
                  label="Name"
                  placeholder="Your full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  disabled={loading}
                />
              )}

              {isSignUp && (
                <TextInput
                  label="Username"
                  placeholder="Your username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  disabled={loading}
                />
              )}

              <TextInput
                label={isSignUp ? "Email" : "Email or Username"}
                placeholder={isSignUp ? "Your email address" : "Your email or username"}
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

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                disabled={loading}
              />

              {error && (
                <Text size="sm" c="red">
                  {error}
                </Text>
              )}

              <Button type="submit" fullWidth loading={loading}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Group justify="center" gap="xs">
            <Text size="sm" c="dimmed">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </Text>
            <Anchor
              size="sm"
              component="button"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Anchor>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <Container size="xs" className="flex min-h-screen items-center justify-center py-12">
        <Text>Loading...</Text>
      </Container>
    }>
      <SignInForm />
    </Suspense>
  );
}
