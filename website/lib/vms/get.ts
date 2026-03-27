"use server";

import prisma from "@/lib/prisma";

export async function getUserVMs(userId: string) {
  const vms = await prisma.vM.findMany({
    where: { userId: userId },
  });

  return vms.map((vm) => ({ ...vm, name: vm.name || `vm-${vm.proxmoxId}` }));
}
