import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function DELETE(
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

    // Delete all answers for this scenario
    const result = await prisma.userAnswers.deleteMany({
      where: {
        userId: user.id,
        curriculum: { scenarioId },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Cleared ${result.count} answers for this scenario`,
    });
  } catch (error) {
    console.error("Error clearing scenario answers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
