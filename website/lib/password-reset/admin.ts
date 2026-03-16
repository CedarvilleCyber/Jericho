"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import prisma from "../prisma";

export async function resetPassword(
  userId: string,
  newPassword: string,
): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Not authenticated" };

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { userRoles: true },
  });
  if (!currentUser?.userRoles?.find((r) => r.role === "ADMIN")) {
    return { error: "Forbidden" };
  }

  const ctx = await auth.$context;
  const hashed = await ctx.password.hash(newPassword);
  await prisma.account.updateMany({
    where: { userId, providerId: "credential" },
    data: { password: hashed },
  });

  return {};
}
