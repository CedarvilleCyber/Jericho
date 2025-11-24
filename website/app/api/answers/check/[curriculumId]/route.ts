import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ curriculumId: string }> }
) {
  try {
    const { curriculumId } = await params; // Await params first

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ answered: false });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ answered: false });
    }

    const userAnswer = await prisma.userAnswers.findUnique({
      where: {
        userId_curriculumId: {
          userId: user.id,
          curriculumId: curriculumId, // Now use curriculumId
        },
      },
    });

    if (!userAnswer) {
      return NextResponse.json({ answered: false });
    }

    return NextResponse.json({
      answered: true,
      isCorrect: userAnswer.isCorrect,
      answer: userAnswer.answer,
    });
  } catch (error) {
    console.error("Error checking answer:", error);
    return NextResponse.json({ answered: false });
  }
}
