"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";

export async function joinScenario(formData: FormData) {
  const userId = formData.get("userId") as string;
  const scenarioId = formData.get("scenarioId") as string;
  await prisma.userScenario.create({
    data: {
      userId,
      scenarioId,
    },
  });
  revalidatePath(`/scenarios/${scenarioId}`);
}
