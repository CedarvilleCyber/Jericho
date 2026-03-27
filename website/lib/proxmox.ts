import proxmoxApi from "proxmox-api";
import { requireEnv } from "@/lib/require-env";

export const proxmox = proxmoxApi({
  host: process.env.PVE_HOST || "pve.jericho.local",
  port: process.env.PVE_PORT ? parseInt(process.env.PVE_PORT) : 8006,
  tokenID: requireEnv("PVE_TOKEN_ID"),
  tokenSecret: process.env.PVE_TOKEN_SECRET || "",
});
