"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function joinScenario(formData: FormData) {
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) throw new Error("Missing userId");
  const scenarioId = formData.get("scenarioId");
  if (typeof scenarioId !== "string" || !scenarioId)
    throw new Error("Missing scenarioId");

  await prisma.userScenario.create({
    data: {
      userId,
      scenarioId,
    },
  });
  revalidatePath(`/scenarios/${scenarioId}`);
}
