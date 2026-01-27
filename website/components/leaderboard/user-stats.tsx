import { prisma } from "@/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import SkillsMatrix from "./skills-matrix";

export default async function UserStats() {
  const { user: authenticatedUser } = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: authenticatedUser.id },
    include: {
      userAnswers: {
        where: { isCorrect: true },
        include: {
          curriculum: {
            select: { id: true, pointValue: true, scenarioId: true },
          },
        },
      },
    },
  });

  // Calculate total points
  const totalPoints = user.userAnswers.reduce(
    (sum, answer) => sum + answer.curriculum.pointValue,
    0
  );

  // Count completed scenarios (all questions in scenario answered correctly)
  const completedScenarios = await prisma.scenario.findMany({
    select: { id: true, questions: { select: { id: true } } },
  });

  const completedCount = completedScenarios.filter((scenario) => {
    const allQuestionsAnswered = scenario.questions.every((q) =>
      user.userAnswers.some((a) => a.curriculum.id === q.id)
    );
    return allQuestionsAnswered && scenario.questions.length > 0;
  }).length;

  // Calculate ranking
  const allUsers = await prisma.user.findMany({
    include: {
      userAnswers: {
        where: { isCorrect: true },
        include: { curriculum: { select: { pointValue: true } } },
      },
    },
  });

  const ranking =
    allUsers
      .map((u) => ({
        email: u.email,
        points: u.userAnswers.reduce(
          (sum, a) => sum + a.curriculum.pointValue,
          0
        ),
      }))
      .sort((a, b) => b.points - a.points)
      .findIndex((u) => u.email === user.email) + 1;

  const totalUsers = allUsers.filter((u) => u.userAnswers.length > 0).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Scenarios Completed
          </h3>
          <p className="text-3xl font-bold">{completedCount}</p>
        </div>

        <div className="rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Points
          </h3>
          <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
        </div>

        <div className="rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Your Ranking
          </h3>
          <p className="text-3xl font-bold">
            #{ranking}{" "}
            <span className="text-sm text-muted-foreground">
              of {totalUsers}
            </span>
          </p>
        </div>
      </div>

      <SkillsMatrix />
    </>
  );
}
