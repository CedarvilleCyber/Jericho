import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Force Node runtime so Prisma works
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const { curriculumId, answer } = await request.json();

    if (!curriculumId || answer === undefined) {
      return NextResponse.json(
        { error: "Missing curriculumId or answer" },
        { status: 400 }
      );
    }

    // Get the curriculum (question)
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });

    if (!curriculum) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Validate format if validation regex exists
    let isFormatValid = true;
    if (curriculum.validation) {
      const regex = new RegExp(curriculum.validation);
      isFormatValid = regex.test(answer.trim());
    }

    if (!isFormatValid) {
      return NextResponse.json(
        { error: "Answer format is incorrect", isCorrect: false },
        { status: 400 }
      );
    }

    // Check if user already answered this question CORRECTLY
    const existingAnswer = await prisma.userAnswers.findUnique({
      where: {
        userId_curriculumId: {
          userId: user.id,
          curriculumId: curriculumId,
        },
      },
    });

    if (existingAnswer && existingAnswer.isCorrect) {
      return NextResponse.json(
        { error: "You have already answered this question correctly" },
        { status: 400 }
      );
    }

    // Check if answer is correct
    const isCorrect = answer.trim() === curriculum.answer;

    // Upsert the user answer
    await prisma.userAnswers.upsert({
      where: {
        userId_curriculumId: {
          userId: user.id,
          curriculumId: curriculumId,
        },
      },
      update: {
        answer,
        isCorrect,
      },
      create: {
        userId: user.id,
        curriculumId,
        answer,
        isCorrect,
      },
    });

    // If correct answer, revalidate the scenario page to show next question
    if (isCorrect) {
      const scenario = await prisma.curriculum.findUnique({
        where: { id: curriculumId },
        select: { scenario: { select: { slug: true } } },
      });
      if (scenario?.scenario?.slug) {
        revalidatePath(`/webapp/scenarios/${scenario.scenario.slug}`);
      }
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      message: isCorrect ? "Correct answer!" : "Incorrect answer!",
      points: isCorrect ? curriculum.pointValue : 0,
    });
  } catch (error) {
    console.error("Answer submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
