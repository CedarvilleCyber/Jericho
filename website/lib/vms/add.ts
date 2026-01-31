"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { proxmox } from "../proxmox";

export async function addExistingVMToUser(vmId: number, userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user?.proxmoxId) {
    throw new Error("User does not have a Proxmox ID");
  }

  const pveVM = await proxmox.nodes
    .$(process.env.PVE_NODE || "jericho01")
    .qemu.$(vmId).config.$get();

  if (!pveVM) {
    throw new Error("VM does not exist in Proxmox");
  }

  await proxmox.access.acl.$put({
    path: `/vms/${vmId}`,
    roles: "PVEVMUser",
    users: `${user?.proxmoxId}@pve`,
    propagate: false,
  });

  await prisma.vM.create({
    data: {
      proxmoxId: vmId,
      userId: userId,
      name: pveVM.name || `vm-${vmId}`,
    },
  });

  revalidatePath("/admin");
}

export async function cloneVMTemplateToUser(
  templateId: number,
  newVmName: string,
  userId: string,
) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user?.proxmoxId) {
    throw new Error("User does not have a Proxmox ID");
  }

  const newId =
    (await prisma.vM.findMany())
      .map((vm) => vm.proxmoxId)
      .reduce((max, id) => {
        return id > max ? id : max;
      }, 1200) + 1;

  await proxmox.nodes
    .$(process.env.PVE_NODE || "jericho01")
    .qemu.$(templateId)
    .clone.$post({
      newid: newId,
      name: `${newId}-${newVmName}`,
      full: false,
      target: process.env.PVE_NODE || "jericho01",
    });

  await proxmox.access.acl.$put({
    path: `/vms/${newId}`,
    roles: "PVEVMUser",
    users: `${user?.proxmoxId}@pve`,
    propagate: false,
  });

  await prisma.vM.create({
    data: {
      proxmoxId: newId,
      userId: userId,
      name: newVmName,
    },
  });
  revalidatePath("/admin");
}
