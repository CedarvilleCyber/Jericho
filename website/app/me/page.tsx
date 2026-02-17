"use client";

import { authClient } from "@/lib/auth-client";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
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
      <Container size="sm" className="py-8">
        <Box h="50vh" className="flex flex-col justify-center items-center">
          <Loader size="xl" />
        </Box>
      </Container>
    );
  }

  if (!data?.session) {
    return null;
  }

  return (
    <Container size="sm" className="py-8">
      <Breadcrumbs mb="lg">
        <Link href="/">Home</Link>
        <Text>My Profile</Text>
      </Breadcrumbs>
      <Stack gap="lg">
        <div>
          <Title order={2} className="mb-2">
            My Profile
          </Title>
          <Text size="sm" c="dimmed">
            Update your account information
          </Text>
        </div>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Name"
                placeholder="Your full name"
                required
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                disabled={loading}
              />

              <TextInput
                label="Username"
                placeholder="Your username"
                required
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                disabled={loading}
              />

              <TextInput
                label="Email"
                placeholder="Your email address"
                type="email"
                value={email}
                disabled
                description="Email cannot be changed"
              />

              {error && (
                <Text size="sm" c="red">
                  {error}
                </Text>
              )}

              {success && (
                <Text size="sm" c="green">
                  {success}
                </Text>
              )}

              <Group justify="flex-end" gap="sm">
                <Button
                  variant="subtle"
                  onClick={() => router.push("/")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}
