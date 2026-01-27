import prisma from "@/prisma";
import { proxmox } from "@/proxmox";

export async function cloneVM(vmId: number, userId: string) {
  const newid =
    (await prisma.vMs.findMany())
      .map((v) => v.vmId)
      .reduce((a, b) => Math.max(a, b), 1000) + 1;

  await proxmox.nodes
    .$(process.env.PVE_NODE!)
    .qemu.$(vmId)
    .clone.$post({
      newid,
      full: false,
      name: `user-vm-${userId}`,
    });

  await proxmox.access.acl.$put({
    path: `/vms/${newid}`,
    roles: "PVEVMUser",
    users: `userId@pve`,
    propagate: false,
  });

  return newid;
}
