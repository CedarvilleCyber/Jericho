import ScenarioLayout from "@/components/scenario/scenario";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.email) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/signin");
  }

  const scenario = await prisma.scenario.findUnique({
    where: { slug: id },
    include: { questions: { orderBy: { createdAt: "asc" } } },
  });

  if (!scenario) {
    notFound();
  }

  // Get user's CORRECT answers for this scenario
  const userAnswers = await prisma.userAnswers.findMany({
    where: {
      userId: user.id,
      curriculum: { scenarioId: scenario.id },
      isCorrect: true,  // Only correct answers
    },
  });

  // Find the first question that hasn't been answered correctly
  const correctAnsweredIds = new Set(userAnswers.map((a) => a.curriculumId));
  const firstUnansweredIndex = scenario.questions.findIndex(
    (q) => !correctAnsweredIds.has(q.id)
  );

  // Show only correct answers + the first unanswered question
  const visibleQuestions =
    firstUnansweredIndex === -1
      ? scenario.questions // All answered correctly
      : scenario.questions.slice(0, firstUnansweredIndex + 1);

  // Add answer status to each question
  const questionsWithStatus = visibleQuestions.map((q) => ({
    ...q,
    answered: correctAnsweredIds.has(q.id),
  }));

  return <ScenarioLayout scenario={{ ...scenario, questions: questionsWithStatus }} />;
}
