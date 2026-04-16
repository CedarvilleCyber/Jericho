"use server";

import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function updateLivestreamPageConfig(
  layout: number,
  streams: { position: number; streamKey: string; label: string }[],
) {
  const guard = await requireAdminSession();
  if (guard) return guard;

  const existing = await prisma.livestreamPageConfig.findFirst();

  if (existing) {
    await prisma.livestreamPageStream.deleteMany({ where: { configId: existing.id } });
    await prisma.livestreamPageConfig.update({
      where: { id: existing.id },
      data: {
        layout,
        streams: {
          create: streams.map((s) => ({
            position: s.position,
            streamKey: s.streamKey,
            label: s.label,
          })),
        },
      },
    });
  } else {
    await prisma.livestreamPageConfig.create({
      data: {
        layout,
        streams: {
          create: streams.map((s) => ({
            position: s.position,
            streamKey: s.streamKey,
            label: s.label,
          })),
        },
      },
    });
  }

  revalidatePath("/livestream");
  return { success: true };
}
