import proxmoxApi from "proxmox-api";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function maskSecret(secret?: string) {
  if (!secret) return "<empty>";
  return `<redacted length=${secret.length}>`;
}

async function createPVEUser(userId: string, initialAccess: Array<string>) {
  console.log(`[${new Date().toISOString()}] Starting createPVEUser`);
  console.log(
    `[${new Date().toISOString()}] Inputs - userId: ${userId}, initialAccess: ${JSON.stringify(
      initialAccess
    )}`
  );

  const host = process.env.PVE_HOST || "pve.jericho.local";
  const hostSource = process.env.PVE_HOST ? "env" : "default";
  const port = process.env.PVE_PORT ? parseInt(process.env.PVE_PORT) : 8006;
  const portSource = process.env.PVE_PORT ? "env" : "default";

  // For API Token authentication:
  // username format: "username@realm!tokenname"
  // password: the actual token secret
  const username = process.env.PVE_USER || "api-super@pve!mytoken";
  const usernameSource = process.env.PVE_USER ? "env" : "default";
  const tokenSecret =
    process.env.PVE_TOKEN_SECRET ||
    process.env.PVE_PASSWORD ||
    "your-token-secret-here";
  const tokenSecretSource = process.env.PVE_TOKEN_SECRET
    ? "PVE_TOKEN_SECRET"
    : process.env.PVE_PASSWORD
    ? "PVE_PASSWORD"
    : "default";

  const createUserPassword =
    process.env.PVE_CREATE_USER_PASSWORD || "DefaultPassword123!";
  const createUserPasswordSource = process.env.PVE_CREATE_USER_PASSWORD
    ? "env"
    : "default";

  console.log(`[${new Date().toISOString()}] Configuration:`);
  console.log(`  host: ${host} (${hostSource})`);
  console.log(`  port: ${port} (${portSource})`);
  console.log(`  username (token): ${username} (${usernameSource})`);
  console.log(
    `  tokenSecret: ${maskSecret(tokenSecret)} (${tokenSecretSource})`
  );
  console.log(
    `  createUserPassword: ${maskSecret(
      createUserPassword
    )} (${createUserPasswordSource})`
  );

  const proxmox = proxmoxApi({
    host,
    port,
    username,
    password: tokenSecret,
  });

  // Create user
  const userPayload = {
    userid: `${userId}@pve`,
    password: createUserPassword,
    enable: true,
  };
  console.log(
    `[${new Date().toISOString()}] Creating user with payload (password masked): ${JSON.stringify(
      {
        userid: userPayload.userid,
        password: maskSecret(userPayload.password),
        enable: userPayload.enable,
      }
    )}`
  );

  try {
    const createResult = await proxmox.access.users.$post(userPayload);
    console.log(
      `[${new Date().toISOString()}] User creation result: ${JSON.stringify(
        createResult
      )}`
    );
  } catch (err: any) {
    console.error(
      `[${new Date().toISOString()}] Error creating user ${
        userPayload.userid
      }:`,
      err?.message ?? err
    );
    // If proxmox-api gives a response body, try to log it
    if (err?.response) {
      try {
        console.error(
          " proxmox response data:",
          JSON.stringify(err.response.data)
        );
      } catch {
        console.error(" proxmox response (unserializable):", err.response);
      }
    }
    throw err;
  }

  // Apply ACLs
  console.log(
    `[${new Date().toISOString()}] Applying ACLs for ${userPayload.userid}`
  );
  const aclTasks = initialAccess.map(async (path) => {
    const aclPayload = {
      path,
      roles: "PVEVMUser",
      users: `${userId}@pve`,
      propagate: true,
    };
    console.log(
      `[${new Date().toISOString()}] Applying ACL: ${JSON.stringify(
        aclPayload
      )}`
    );
    try {
      const aclResult = await proxmox.access.acl.$put(aclPayload);
      console.log(
        `[${new Date().toISOString()}] ACL applied for path ${path}: ${JSON.stringify(
          aclResult
        )}`
      );
      return { path, success: true, result: aclResult };
    } catch (err: any) {
      console.error(
        `[${new Date().toISOString()}] Error applying ACL for path ${path}:`,
        err?.message ?? err
      );
      if (err?.response) {
        try {
          console.error(
            " proxmox response data:",
            JSON.stringify(err.response.data)
          );
        } catch {
          console.error(" proxmox response (unserializable):", err.response);
        }
      }
      return { path, success: false, error: err };
    }
  });

  const aclResults = await Promise.all(aclTasks);
  console.log(
    `[${new Date().toISOString()}] ACL application summary: ${JSON.stringify(
      aclResults.map((r) => ({ path: r.path, success: r.success }))
    )}`
  );

  const failed = aclResults.filter((r) => !r.success);
  if (failed.length) {
    console.warn(
      `[${new Date().toISOString()}] Some ACLs failed: ${JSON.stringify(
        failed.map((f) => f.path)
      )}`
    );
  } else {
    console.log(`[${new Date().toISOString()}] All ACLs applied successfully`);
  }
}

(async () => {
  try {
    await createPVEUser("cmghd1nos000004l8f7jrgwis", ["/vms/800", "/vms/801"]);
    console.log(`[${new Date().toISOString()}] createPVEUser finished`);
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] createPVEUser failed:`,
      err?.message ?? err
    );
    process.exitCode = 1;
  }
})();
