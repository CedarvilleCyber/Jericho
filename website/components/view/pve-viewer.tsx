"use client";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/lib/db/user";
import { getTicket } from "@/lib/proxmox-api/ticket";
import { Loader, Stack } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PVEViewer({ vmId }: { vmId: number }) {
  const [loading, setLoading] = useState(true);
  const [noVncConsoleURL, setNoVncConsoleURL] = useState<string | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function setAuthCookie() {
      if (!session?.user) return;
      const user = await getUser(session.user.id);
      if (!user?.proxmoxId) return;

      await getTicket(user.proxmoxId);
      setNoVncConsoleURL(
        `https://${process.env.NEXT_PUBLIC_PVE_HOST}:${process.env.NEXT_PUBLIC_PVE_PORT}` +
          `?console=kvm&novnc=1&vmid=${vmId}&node=${process.env.NEXT_PUBLIC_PVE_NODE}`,
      );
      setLoading(false);
    }
    setAuthCookie();
  }, [session?.user]);

  if (loading) {
    return (
      <Stack align="center" justify="center" className="h-full">
        <Loader size="xl" />
      </Stack>
    );
  }

  return (
    <Link
      href={noVncConsoleURL || "#"}
      target="_blank"
      rel="noopener noreferrer"
    >
      <iframe
        src={noVncConsoleURL || ""}
        title="PVE Console"
        className="w-full h-full min-h-60 pointer-events-none"
      />
    </Link>
  );
}
