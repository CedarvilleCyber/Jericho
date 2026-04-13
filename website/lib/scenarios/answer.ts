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
  if (question.type === "NUMERIC") {
    correct = parseFloat(answer.trim()) === parseFloat(question.answer.trim());
  } else if (question.answerIsRegex) {
    try {
      correct = new RegExp(question.answer).test(answer.trim());
    } catch {
      correct = false;
    }
  } else {
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

export async function revealHint(hintId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).userHint.upsert({
    where: { userId_hintId: { userId: session.user.id, hintId } },
    create: { userId: session.user.id, hintId },
    update: {},
  });
}
