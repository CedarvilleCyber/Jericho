"use client";

import { Avatar, Button, Container, Menu } from "@mantine/core";
import {
  IconDeviceDesktop,
  IconLogout,
  IconSettings,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import ColorSchemeToggle from "../color-scheme-toggle";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getUserRoles } from "@/lib/user/roles";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/logo256.png";

export default function AppBar() {
  const { data } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (data?.user?.id) {
      getUserRoles(data.user.id).then((roles) => {
        setIsAdmin(roles.includes("ADMIN"));
      });
    }
  }, [data?.user?.id]);

  return (
    <header
      className="h-14 border-b sticky top-0 z-50"
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        borderColor: 'var(--mantine-color-default-border)'
      }}
    >
      <Container size="md">
        <div className="flex justify-between items-center h-14">
          <Link href={data?.session ? "/" : "/"} className="flex gap-3">
            <Image src={logo} alt="Jericho Logo" width={32} height={32} />
            <h1 className="text-2xl font-semibold">Jericho</h1>
          </Link>
          <div className="flex items-center gap-2">
            <ColorSchemeToggle />
            {data?.session ? (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Avatar
                    src={data.user.image}
                    alt={data.user.name ?? "User"}
                    radius="xl"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <IconUser size={18} />
                  </Avatar>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{data.user.name ?? data.user.email}</Menu.Label>
                  <Menu.Item
                    component={Link}
                    href="/vms"
                    leftSection={<IconDeviceDesktop size={16} />}
                  >
                    My VMs
                  </Menu.Item>
                  <Menu.Item
                    component={Link}
                    href="/account/settings"
                    leftSection={<IconSettings size={16} />}
                  >
                    Account
                  </Menu.Item>
                  {isAdmin && (
                    <Menu.Item
                      component={Link}
                      href="/admin"
                      leftSection={<IconShieldLock size={16} />}
                    >
                      Admin
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    onClick={() => authClient.signOut()}
                    leftSection={<IconLogout size={16} />}
                    color="red"
                  >
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
