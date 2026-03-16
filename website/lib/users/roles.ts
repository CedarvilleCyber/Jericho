"use server";

import { Role } from "@/app/generated/prisma/browser";
import { headers } from "next/headers";
import { auth } from "../auth";
import prisma from "../prisma";

export async function updateUserRoles(
  userId: string,
  roles: Role[],
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

  await prisma.userRole.deleteMany({ where: { userId } });
  if (roles.length > 0) {
    await prisma.userRole.createMany({
      data: roles.map((role) => ({ userId, role })),
    });
  }

  return {};
}
