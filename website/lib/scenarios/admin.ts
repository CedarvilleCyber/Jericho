"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setUserScenarioVM(formData: FormData) {
  const userScenarioId = formData.get("userScenarioId");
  if (typeof userScenarioId !== "string" || !userScenarioId)
    throw new Error("Missing userScenarioId");
  const vmId = formData.get("vmId") as string | null;

  await prisma.userScenario.update({
    where: { id: userScenarioId },
    data: { vmId: vmId || null },
  });

  revalidatePath(`/admin/user-scenario/${userScenarioId}`);
}
