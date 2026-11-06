"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { avatarFileFromUrl, deleteUpload } from "./storage";

export async function removeAvatar(): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Not authenticated" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });

  const oldFile = avatarFileFromUrl(session.user.image);
  if (oldFile) await deleteUpload("avatars", oldFile);

  return {};
}
