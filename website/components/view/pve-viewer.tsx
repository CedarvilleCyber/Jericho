"use client";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/lib/db/user";
import { getTicket } from "@/lib/proxmox-api/ticket";
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
      <div className="flex flex-col items-center justify-center h-full">
        <span className="loading loading-spinner loading-xl" />
      </div>
    );
  }

  return (
    <Link
      href={noVncConsoleURL || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="basis-full"
    >
      <iframe
        src={noVncConsoleURL || ""}
        title="PVE Console"
        className="w-full h-full min-h-60 pointer-events-none"
      />
    </Link>
  );
}
