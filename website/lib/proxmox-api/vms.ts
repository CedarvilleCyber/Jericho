"use server";

import { proxmox } from "../proxmox";

export async function getAllVMs() {
  return await proxmox.nodes.$(process.env.PVE_NODE || "jericho01").qemu.$get();
}
