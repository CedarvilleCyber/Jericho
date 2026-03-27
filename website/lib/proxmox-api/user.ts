"use server";

import prisma from "@/lib/prisma";
import { proxmox } from "@/lib/proxmox";
import { requireEnv } from "@/lib/require-env";
import { nanoid } from "nanoid";
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
    password: requireEnv("PVE_CREATE_USER_PASSWORD"),
    enable: true,
  });

  revalidatePath("/admin");
}
