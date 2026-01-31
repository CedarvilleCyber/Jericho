"use server";

import { cookies } from "next/headers";
import { proxmox } from "../proxmox";

export async function getTicket(proxmoxId: string) {
  const ticket = await proxmox.access.ticket.$post({
    username: `${proxmoxId}@pve`,
    password: process.env.PVE_CREATE_USER_PASSWORD || "DefaultPassword123!",
  });
  const cookieStore = await cookies();
  cookieStore.set("PVEAuthToken", ticket.ticket ?? "", {
    path: "/",
    domain: ".alexthetaylor.com",
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
}
