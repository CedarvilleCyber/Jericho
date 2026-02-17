import {
  Card,
  Container,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconDeviceDesktop,
  IconShieldCheck,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";

interface NavigationHubProps {
  userName: string;
  isAdmin: boolean;
}

export function NavigationHub({ userName, isAdmin }: NavigationHubProps) {
  return (
    <Container size="sm" className="py-12 pb-24">
      <Card shadow="md" padding="xl" radius="md" withBorder className="mb-6">
        <Stack gap="xs">
          <Title order={2}>
            Welcome, <span className="text-blue-500">{userName}</span>
          </Title>
          <Text c="dimmed">What would you like to do?</Text>
        </Stack>
      </Card>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Link href="/vms" className="no-underline">
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="h-full transition-transform duration-200 hover:scale-[1.03]"
          >
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color="blue"
              className="mb-3"
            >
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
              <ThemeIcon
                size={48}
                radius="md"
                variant="light"
                color="red"
                className="mb-3"
              >
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
        <Link href="/me/scenarios" className="no-underline">
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="h-full transition-transform duration-200 hover:scale-[1.03]"
          >
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color="green"
              className="mb-3"
            >
              <IconShieldCheck size={24} />
            </ThemeIcon>
            <Title order={4} className="mb-2">
              My Scenarios
            </Title>
            <Text size="sm" c="dimmed">
              View and manage your scenario progress.
            </Text>
          </Card>
        </Link>
        <Link href="/scenarios" className="no-underline">
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="h-full transition-transform duration-200 hover:scale-[1.03]"
          >
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color="teal"
              className="mb-3"
            >
              <IconUser size={24} />
            </ThemeIcon>
            <Title order={4} className="mb-2">
              Explore Scenarios
            </Title>
            <Text size="sm" c="dimmed">
              Browse and start new cyber-physical scenarios.
            </Text>
          </Card>
        </Link>
      </SimpleGrid>
    </Container>
  );
}
