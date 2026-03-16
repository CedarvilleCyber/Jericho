"use server";

import { Role } from "@/app/generated/prisma/browser";
import { requireAdminSession } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

export async function getUserRoles(userId: string) {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    select: { role: true },
  });
  return roles.map((r) => r.role);
}

export async function updateUserRoles(
  userId: string,
  roles: Role[],
): Promise<{ error?: string }> {
  const guard = await requireAdminSession();
  if (guard) return guard;

  await prisma.userRole.deleteMany({ where: { userId } });
  if (roles.length > 0) {
    await prisma.userRole.createMany({
      data: roles.map((role) => ({ userId, role })),
    });
  }

  return {};
}
