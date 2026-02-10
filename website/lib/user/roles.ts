"use server";

import prisma from "@/lib/prisma";

export async function getUserRoles(userId: string) {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    select: { role: true },
  });
  return roles.map((r) => r.role);
}
