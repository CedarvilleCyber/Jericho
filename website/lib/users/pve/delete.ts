"use server";

import prisma from "@/prisma";   
import { proxmox } from "@/proxmox";
import { revalidatePath } from "next/cache";

export async function deletePVEUser(pveUserId: string) {
  await proxmox.access.users.$(`${pveUserId}@pve`).$delete();
  await prisma?.user.updateMany({
    where: { proxmoxId: pveUserId },
    data: { proxmoxId: null },
  });
  revalidatePath("/admin");
}
