"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function requireAdminSession(): Promise<{ error: string } | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Not authenticated" };
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { userRoles: { select: { role: true } } },
  });
  if (!currentUser?.userRoles?.some((r) => r.role === "ADMIN")) {
    return { error: "Forbidden" };
  }
  return null;
}
