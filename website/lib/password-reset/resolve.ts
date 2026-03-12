"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function resolvePasswordReset(
  requestId: string,
  newPassword: string
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

  const resetRequest = await prisma.passwordResetRequest.findUnique({
    where: { id: requestId },
  });
  if (!resetRequest || resetRequest.status !== "PENDING") {
    return { error: "Request not found or already resolved" };
  }

  const ctx = await auth.$context;
  const hashed = await ctx.password.hash(newPassword);
  await prisma.account.updateMany({
    where: { userId: resetRequest.userId, providerId: "credential" },
    data: { password: hashed },
  });

  await prisma.passwordResetRequest.update({
    where: { id: requestId },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  revalidatePath("/admin");
  return {};
}
