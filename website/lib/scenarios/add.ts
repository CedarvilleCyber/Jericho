"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addVMToScenario(formData: FormData) {
  const vmId = formData.get("vmId");
  if (typeof vmId !== "string" || !vmId) throw new Error("Missing vmId");
  const scenarioId = formData.get("scenarioId");
  if (typeof scenarioId !== "string" || !scenarioId)
    throw new Error("Missing scenarioId");
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) throw new Error("Missing userId");

  await prisma.userScenario.update({
    where: {
      userId_scenarioId: {
        userId,
        scenarioId,
      },
    },
    data: {
      vmId,
    },
  });

  revalidatePath(`/me/scenarios/${scenarioId}`);
}

export async function addExistingScenarioToUser(formData: FormData) {
  const scenarioId = formData.get("scenarioId");
  if (typeof scenarioId !== "string" || !scenarioId)
    throw new Error("Missing scenarioId");
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) throw new Error("Missing userId");

  await prisma.userScenario.create({
    data: {
      userId,
      scenarioId,
    },
  });

  revalidatePath(`/admin/users`);
}
