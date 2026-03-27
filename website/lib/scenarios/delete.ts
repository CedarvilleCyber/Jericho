"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUserScenario(formData: FormData) {
  const userScenarioId = formData.get("userScenarioId");
  if (typeof userScenarioId !== "string" || !userScenarioId)
    throw new Error("Missing userScenarioId");

  await prisma.userScenario.delete({
    where: {
      id: userScenarioId,
    },
  });
  revalidatePath("/admin/users");
}
