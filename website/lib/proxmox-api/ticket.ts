"use server";

import { cookies } from "next/headers";
import proxmoxApi from "proxmox-api";

export async function getTicket(proxmoxId: string) {
  const password = process.env.PVE_CREATE_USER_PASSWORD || "DefaultPassword123!";
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
  cookieStore.set("PVEAuthCookie", ticket.ticket ?? "", {
    path: "/",
    domain: ".alexthetaylor.com",
    httpOnly: true,
    secure: true,
  });
}
