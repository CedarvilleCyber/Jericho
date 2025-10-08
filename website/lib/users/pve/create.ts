"use server";

import { proxmoxApi } from "proxmox-api";

export async function createPVEUser(
  userId: string,
  initialAccess: Array<string>
) {
  const proxmox = proxmoxApi({
    host: process.env.PVE_HOST || "pve.jericho.local",
    port: process.env.PVE_PORT ? parseInt(process.env.PVE_PORT) : 8006,
    username: process.env.PVE_USER || "root@pam",
    password: process.env.PVE_PASSWORD || "password",
  });

  await proxmox.access.users.$post({
    userid: `${userId}@pve`,
    password: process.env.PVE_CREATE_USER_PASSWORD || "DefaultPassword123!",
    enable: true,
  });

  await Promise.all(
    initialAccess.map((path) =>
      proxmox.access.acl.$put({
        path,
        roles: "PVEVMUser",
        users: `${userId}@pve`,
        propagate: true,
      })
    )
  );
}
