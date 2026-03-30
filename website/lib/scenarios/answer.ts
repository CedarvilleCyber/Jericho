"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitAnswer(
  questionId: string,
  answer: string,
): Promise<{ correct: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new Error("Question not found");

  let correct: boolean;
  switch (question.type) {
    case "NUMERIC":
      correct = parseFloat(answer.trim()) === parseFloat(question.answer.trim());
      break;
    default:
      correct = answer.trim() === question.answer.trim();
  }

  await prisma.userAnswer.upsert({
    where: { userId_questionId: { userId: session.user.id, questionId } },
    create: { userId: session.user.id, questionId, answer },
    update: { answer },
  });

  revalidatePath(`/me/scenarios`);
  return { correct };
}
