"use server";

import { requireAdminSession } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { avatarFileFromUrl, deleteUpload } from "@/lib/uploads/storage";
import { redirect } from "next/navigation";

export async function deleteUser(
  userId: string,
): Promise<{ error?: string } | never> {
  const guard = await requireAdminSession();
  if (guard) return guard;

  const { image } = await prisma.user.delete({
    where: { id: userId },
    select: { image: true },
  });

  const avatarFile = avatarFileFromUrl(image);
  if (avatarFile) await deleteUpload("avatars", avatarFile);

  redirect("/admin");
}
