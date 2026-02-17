"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";

export async function deleteUserScenario(formData: FormData) {
  const userScenarioId = formData.get("userScenarioId") as string;
  await prisma.userScenario.delete({
    where: {
      id: userScenarioId,
    },
  });
  revalidatePath("/admin/users"); 
}
