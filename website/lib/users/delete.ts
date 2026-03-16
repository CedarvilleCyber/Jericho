"use server";

import { requireAdminSession } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function deleteUser(
  userId: string,
): Promise<{ error?: string } | never> {
  const guard = await requireAdminSession();
  if (guard) return guard;

  await prisma.user.delete({ where: { id: userId } });

  redirect("/admin");
}
