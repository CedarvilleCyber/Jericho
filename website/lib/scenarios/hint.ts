"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function useHint(userScenarioId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const userScenario = await prisma.userScenario.findUnique({
    where: { id: userScenarioId },
  });
  if (!userScenario || userScenario.userId !== session.user.id) {
    throw new Error("Not found");
  }

  await prisma.userScenario.update({
    where: { id: userScenarioId },
    data: { hintsUsed: { increment: 1 } },
  });

  revalidatePath("/me/scenarios");
}
