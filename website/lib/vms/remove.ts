"use server";

import prisma from "@/lib/prisma";
import { proxmox } from "@/lib/proxmox";
import { revalidatePath } from "next/cache";

export async function removeVM(proxmoxId: number, userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user?.proxmoxId) {
    throw new Error("User does not have a Proxmox ID");
  }

  await proxmox.access.acl.$put({
    delete: true,
    path: `/vms/${proxmoxId}`,
    roles: "PVEVMUser",
    users: `${user?.proxmoxId}@pve`,
    propagate: false,
  });
  await prisma.vM.deleteMany({
    where: {
      proxmoxId: proxmoxId,
      userId: userId,
    },
  });

  revalidatePath("/admin");
}

export async function deleteVMFromProxmox(proxmoxId: number) {
  await proxmox.nodes
    .$(process.env.PVE_NODE || "jericho01")
    .qemu.$(proxmoxId)
    .$delete({
      purge: true,
    });

  await prisma.vM.deleteMany({
    where: {
      proxmoxId: proxmoxId,
    },
  });

  revalidatePath("/admin");
}
