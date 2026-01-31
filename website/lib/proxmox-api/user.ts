"use server";

import { nanoid } from "nanoid";
import prisma from "../prisma";
import { proxmox } from "../proxmox";
import { revalidatePath } from "next/cache";

export async function ensureUserHasProxmoxId(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (user?.proxmoxId) {
    return;
  }

  const proxmoxId = nanoid();
  await prisma.user.update({
    where: { id: userId },
    data: { proxmoxId },
  });

  await proxmox.access.users.$post({
    userid: `${proxmoxId}@pve`,
    comment: `User for ${user?.email || "unknown email"}`,
    password: process.env.PVE_CREATE_USER_PASSWORD || "DefaultPassword123!",
    enable: true,
  });

  revalidatePath("/admin");
}
