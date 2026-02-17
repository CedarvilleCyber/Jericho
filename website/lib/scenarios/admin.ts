"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";

export async function setUserScenarioVM(formData: FormData) {
  const userScenarioId = formData.get("userScenarioId") as string;
  const vmId = formData.get("vmId") as string | null;

  await prisma.userScenario.update({
    where: { id: userScenarioId },
    data: { vmId: vmId || null },
  });

  revalidatePath(`/admin/user-scenario/${userScenarioId}`);
}
