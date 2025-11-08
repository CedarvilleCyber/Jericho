import { proxmox } from "@/proxmox";

export async function getUserPermissions(userId: string) {
  return await proxmox.access.permissions.$get({ userid: `${userId}@pve` });
}
