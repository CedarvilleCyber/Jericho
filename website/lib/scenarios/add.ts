"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";

export async function addVMToScenario(formData: FormData) {
  const vmId = formData.get("vmId") as string;
  const scenarioId = formData.get("scenarioId") as string;
  const userId = formData.get("userId") as string;
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
  const scenarioId = formData.get("scenarioId") as string;
  const userId = formData.get("userId") as string;
  await prisma.userScenario.create({
    data: {
      userId,
      scenarioId,
    },
  });
  
  revalidatePath(`/admin/users`);
}
