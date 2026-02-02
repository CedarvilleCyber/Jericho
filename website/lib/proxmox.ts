import proxmoxApi from "proxmox-api";

export const proxmox = proxmoxApi({
  host: process.env.PVE_HOST || "pve.jericho.local",
  port: process.env.PVE_PORT ? parseInt(process.env.PVE_PORT) : 8006,
  tokenID: process.env.PVE_TOKEN_ID || "api-super@pve!new-webapp",
  tokenSecret: process.env.PVE_TOKEN_SECRET || "",
});
