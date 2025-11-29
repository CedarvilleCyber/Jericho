"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function setCookieAndRedirect(
  name: string,
  value: string,
  redirectPath: string
) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, { path: "/" });

  redirect(redirectPath);
}

export async function setCookie(name: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, { path: "/" });
}
