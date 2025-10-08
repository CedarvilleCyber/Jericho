import proxmoxApi from "proxmox-api";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const proxmox = proxmoxApi({
  host: process.env.PVE_HOST || "pve.jericho.local",
  username: process.env.PVE_USER || "root@pam",
  password: process.env.PVE_PASSWORD || "password",
});
