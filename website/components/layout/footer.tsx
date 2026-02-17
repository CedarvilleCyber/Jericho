"use client";

import { authClient } from "@/lib/auth-client";
import { Button, Group } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";

export default function Footer() {
  const { data } = authClient.useSession();

  if (!data?.session) {
    return null;
  }

  return (
    <Group
      gap="sm"
      className="sticky bottom-0 left-0 right-0 px-4 py-3 border-t backdrop-blur-sm z-10"
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        borderColor: 'var(--mantine-color-default-border)'
      }}
      justify="flex-end"
    >
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
  );
}
