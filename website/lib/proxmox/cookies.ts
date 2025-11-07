"use server";

import { cookies } from "next/headers";

async function setCookie(authTicket: string) {
  (await cookies()).set("PVEAuthCookie", authTicket, {
    partitioned: true,
    secure: true,
    sameSite: "none",
  });
}

export { setCookie };
