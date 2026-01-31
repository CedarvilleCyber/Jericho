"use client";

import { Button, Container } from "@mantine/core";
import ColorSchemeToggle from "./color-scheme-toggle";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function AppBar() {
  const { data } = authClient.useSession();

  return (
    <header className="h-14 bg-mantine-color-body border-b border-b-(--mantine-color-gray-3) dark:border-b-(--mantine-color-dark-4)">
      <Container size="md">
        <div className="flex justify-between items-center h-14">
          <Link href={data?.session ? "/vms" : "/"}>
            <h1 className="text-2xl font-semibold">Jericho</h1>
          </Link>
          <div className="flex items-center gap-2">
            <ColorSchemeToggle />
            {data?.session ? (
              <Link href={"/auth/sign-out"}>
                <Button variant="outline" size="sm">
                  Logout
                </Button>
              </Link>
            ) : (
              <Link href={"/auth/sign-in"}>
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
