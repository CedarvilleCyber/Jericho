import { auth } from "@/auth";
import prisma from "@/prisma";
import { proxmox } from "@/proxmox";
import Link from "next/link";
import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import SetAuthCookie from "../vms/set-auth-cookie";

export default async function PVEViewer({
  vmid,
  ...props
}: { vmid: string } & HTMLAttributes<HTMLDivElement>) {
  const session = await auth();
  if (!session?.user) {
    return <div>Please log in to view your VMs.</div>;
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email || undefined },
  });
  const proxmoxTicket = await proxmox.access.ticket.$post({
    username: `${user?.proxmoxId}@pve`,
    password: process.env.PVE_CREATE_USER_PASSWORD || "password",
  });
  const noVncConsoleURL = `https://${
    process.env.PVE_HOST || "jericho.alexthetaylor.com"
  }:${process.env.PVE_PORT || "443"}/?console=kvm&novnc=1&node=${
    process.env.PVE_NODE
  }&vmid=${vmid}`;

  return (
    <div {...props} className={twMerge(props.className, "flex flex-col")}>
      <SetAuthCookie ticket={proxmoxTicket} />
      <Link
        href={noVncConsoleURL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1"
      >
        <iframe
          src={noVncConsoleURL}
          className="w-full h-full min-h-80 pointer-events-none"
        />
      </Link>
    </div>
  );
}
