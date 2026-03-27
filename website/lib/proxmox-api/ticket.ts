"use server";

import { requireEnv } from "@/lib/require-env";
import { cookies } from "next/headers";
import proxmoxApi from "proxmox-api";

export async function getTicket(proxmoxId: string) {
  const password = requireEnv("PVE_CREATE_USER_PASSWORD");
  const ticketClient = proxmoxApi({
    host: process.env.PVE_HOST || "pve.jericho.local",
    port: process.env.PVE_PORT ? parseInt(process.env.PVE_PORT) : 8006,
    username: `${proxmoxId}@pve`,
    password,
  });
  const ticket = await ticketClient.access.ticket.$post({
    username: `${proxmoxId}@pve`,
    password,
  });
  const cookieStore = await cookies();
  const hostParts = (process.env.PVE_HOST || "localhost").split(".");
  const baseDomain =
    hostParts.length <= 2
      ? `.${hostParts[hostParts.length - 1]}`
      : `.${hostParts.slice(-2).join(".")}`;

  cookieStore.set("PVEAuthCookie", ticket.ticket ?? "", {
    path: "/",
    domain: baseDomain,
    httpOnly: true,
    secure: true,
  });
}
