"use client";

import { authClient } from "@/lib/auth-client";
import { getUserRoles } from "@/lib/user/roles";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconDeviceDesktop,
  IconLogout,
  IconShieldCheck,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function LandingPage() {
  return (
    <Container size="sm" className="py-20 text-center">
      <Stack align="center" gap="lg">
        <ThemeIcon size={64} radius="xl" variant="light" color="blue">
          <IconShieldCheck size={36} />
        </ThemeIcon>
        <Badge variant="light" color="blue" size="lg">
          Cyber-Physical City
        </Badge>
        <Title
          order={1}
          className="text-4xl font-bold"
          variant="gradient"
        >
          Jericho
        </Title>
        <Text size="lg" c="dimmed" className="max-w-md">
          Cyber-physical city infrastructure lab environment for hands-on learning and experimentation.
        </Text>
        <Group gap="md">
          <Link href="/auth/sign-in">
            <Button size="lg" variant="filled">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="light">
              Sign Up
            </Button>
          </Link>
        </Group>
      </Stack>
    </Container>
  );
}

function NavigationHub({
  userName,
  isAdmin,
}: {
  userName: string;
  isAdmin: boolean;
}) {
  return (
    <Container size="sm" className="py-12">
      <Stack gap="xs" className="mb-6">
        <Title order={2}>Welcome, {userName}</Title>
        <Text c="dimmed">What would you like to do?</Text>
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Link href="/vms" className="no-underline">
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="h-full transition-transform duration-200 hover:scale-[1.03]"
          >
            <ThemeIcon size={48} radius="md" variant="light" color="blue" className="mb-3">
              <IconDeviceDesktop size={24} />
            </ThemeIcon>
            <Title order={4} className="mb-2">
              My Virtual Machines
            </Title>
            <Text size="sm" c="dimmed">
              Access and manage your virtual machine labs.
            </Text>
          </Card>
        </Link>
        {isAdmin && (
          <Link href="/admin" className="no-underline">
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="h-full transition-transform duration-200 hover:scale-[1.03]"
            >
              <ThemeIcon size={48} radius="md" variant="light" color="red" className="mb-3">
                <IconShieldLock size={24} />
              </ThemeIcon>
              <Title order={4} className="mb-2">
                Admin Dashboard
              </Title>
              <Text size="sm" c="dimmed">
                Manage users, VMs, and platform settings.
              </Text>
            </Card>
          </Link>
        )}
      </SimpleGrid>
      <Group gap="sm" className="mt-8">
        <Link href="/account/settings">
          <Button variant="subtle" leftSection={<IconUser size={16} />}>
            Account
          </Button>
        </Link>
        <Button
          variant="subtle"
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={() => authClient.signOut()}
        >
          Sign Out
        </Button>
      </Group>
    </Container>
  );
}

export default function Home() {
  const { data } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (data?.user?.id) {
      getUserRoles(data.user.id).then((roles) => {
        setIsAdmin(roles.includes("ADMIN"));
      });
    }
  }, [data?.user?.id]);

  if (!data?.session) {
    return <LandingPage />;
  }

  return (
    <NavigationHub
      userName={data.user.name ?? "User"}
      isAdmin={isAdmin}
    />
  );
}
