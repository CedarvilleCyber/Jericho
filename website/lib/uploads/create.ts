"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { avatarFileFromUrl, deleteUpload, saveImage } from "./storage";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function uploadAvatar(formData: FormData): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Not authenticated" };

  const file = formData.get("avatar");
  if (!(file instanceof File)) return { error: "No file uploaded" };
  if (file.size > MAX_BYTES) return { error: "Image must be 5 MB or smaller" };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "Image must be PNG, JPEG, or WebP" };

  let filename: string;
  try {
    filename = await saveImage("avatars", Buffer.from(await file.arrayBuffer()), 256);
  } catch {
    return { error: "That file couldn't be read as an image" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: `/avatars/${filename}` },
  });

  const oldFile = avatarFileFromUrl(session.user.image);
  if (oldFile) await deleteUpload("avatars", oldFile);

  return {};
}
