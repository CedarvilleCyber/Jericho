import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { getSessionFromRequest } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Normalize answer for flexible matching
function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

// Check if answer matches (with flexibility)
function answerMatches(userAnswer: string, correctAnswer: string): boolean {
  const normalized = normalizeAnswer(userAnswer);
  const correct = normalizeAnswer(correctAnswer);

  // Exact match
  if (normalized === correct) return true;

  // For Yes/No questions - accept variations
  if (correct === "yes" || correct === "no") {
    const yesVariations = ["yes", "y", "true"];
    const noVariations = ["no", "n", "false"];
    
    if (correct === "yes") {
      return yesVariations.includes(normalized);
    } else {
      return noVariations.includes(normalized);
    }
  }

  // For credentials (username:password) - case insensitive on username, case sensitive on password
  if (correct.includes(":")) {
    const [correctUser, correctPass] = correct.split(":");
    const [userPart, passPart] = normalized.split(":");
    
    if (userPart && passPart) {
      return normalizeAnswer(correctUser) === userPart && correctPass === passPart;
    }
  }

  // For port lists - normalize and sort for comparison
  if (/^\d{1,5}(,\d{1,5})*$/.test(correct)) {
    const correctPorts = correct.split(",").map(p => p.trim()).sort();
    const userPorts = normalized.split(",").map(p => p.trim()).sort();
    return JSON.stringify(correctPorts) === JSON.stringify(userPorts);
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request.headers);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { curriculumId, answer } = await request.json();

    if (!curriculumId || answer === undefined) {
      return NextResponse.json(
        { error: "Missing curriculumId or answer" },
        { status: 400 }
      );
    }

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
    // Validate format if validation regex exists
    let isFormatValid = true;
    if (curriculum.validation) {
      // Remove trailing 'i' flag from the string if it exists
      const validationPattern = curriculum.validation.endsWith('i') 
        ? curriculum.validation.slice(0, -1) 
        : curriculum.validation;
  
      // Create regex with 'i' flag for case-insensitive matching
      const regex = new RegExp(validationPattern, 'i');
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

    // Check if answer is correct using flexible matching
    const isCorrect = answerMatches(answer, curriculum.answer);

    // Upsert the user answer
    /*const userAnswer = */await prisma.userAnswers.upsert({
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
