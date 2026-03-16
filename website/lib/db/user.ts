"use server";

import prisma from "@/lib/prisma";

export async function getUser(userId: string) {
  return await prisma.user.findUnique({ where: { id: userId } });
}
