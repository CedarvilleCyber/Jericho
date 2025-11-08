"use server";

import prisma from "@/prisma";            
import { proxmox } from "@/proxmox";
import { revalidatePath } from "next/cache";

export async function createPVEUser(
  pveUserId: string,
  initialAccess: string[],
  dbUserId?: number            
) {
  await proxmox.access.users.$post({
    userid: `${pveUserId}@pve`,
    password: process.env.PVE_CREATE_USER_PASSWORD || "DefaultPassword123!",
    enable: true,
  });

  if (dbUserId) {
    await prisma.user.update({
      where: { id: dbUserId },
      data: { proxmoxId: pveUserId },
    });
  }

  await Promise.all(
    initialAccess.map((path) =>
      proxmox.access.acl.$put({
        path,
        roles: "PVEVMUser",
        users: `${pveUserId}@pve`,
        propagate: true,
      })
    )
  );

  revalidatePath("/admin");
}
