import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  try {
    const { scenarioId } = await params;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all questions in order
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: { questions: { orderBy: { createdAt: "asc" } } },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    // Get user's correct answers
    const userAnswers = await prisma.userAnswers.findMany({
      where: {
        userId: user.id,
        curriculum: { scenarioId },
        isCorrect: true,
      },
    });

    const correctAnsweredIds = new Set(userAnswers.map((a) => a.curriculumId));

    // Find first unanswered question
    const nextQuestion = scenario.questions.find(
      (q) => !correctAnsweredIds.has(q.id)
    );

    if (!nextQuestion) {
      return NextResponse.json({ nextQuestion: null });
    }

    // Verify they've answered all previous questions correctly
    const nextIndex = scenario.questions.findIndex((q) => q.id === nextQuestion.id);
    const previousQuestions = scenario.questions.slice(0, nextIndex);

    const allPreviousAnswered = previousQuestions.every((q) =>
      correctAnsweredIds.has(q.id)
    );

    if (!allPreviousAnswered) {
      return NextResponse.json(
        { error: "Cannot access this question yet" },
        { status: 403 }
      );
    }

    return NextResponse.json({ nextQuestion });
  } catch (error) {
    console.error("Error fetching next question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
