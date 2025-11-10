import proxmoxApi from "proxmox-api";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const proxmox = proxmoxApi({
  host: process.env.PVE_HOST || "pve.jericho.local",
  port: process.env.PVE_PORT ? parseInt(process.env.PVE_PORT) : 8006,
  username: process.env.PVE_USER || "root@pam",
  password: process.env.PVE_PASSWORD || "password",
});
