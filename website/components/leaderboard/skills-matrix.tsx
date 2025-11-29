import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SkillsMatrix() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      userAnswers: {
        where: { isCorrect: true },
        include: { 
          curriculum: { 
            select: { 
              pointValue: true, 
              skillCategory: { select: { id: true, label: true } }
            } 
          } 
        },
      },
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // Fetch all skill categories with ALL their questions
  const allCategories = await prisma.skillCategory.findMany({
    include: {
      curriculums: {
        select: { pointValue: true }
      }
    },
    orderBy: { id: 'asc' }
  });

  // Calculate earned points per category
  const earnedMap = new Map<number, number>();
  allCategories.forEach((cat) => {
    earnedMap.set(cat.id, 0);
  });

  user.userAnswers.forEach((answer) => {
    const current = earnedMap.get(answer.curriculum.skillCategory.id) || 0;
    earnedMap.set(answer.curriculum.skillCategory.id, current + answer.curriculum.pointValue);
  });

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Skills Matrix</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCategories.map((category) => {
          const earnedPoints = earnedMap.get(category.id) || 0;
          const possiblePoints = category.curriculums.reduce((sum, q) => sum + q.pointValue, 0);
          const percentage = possiblePoints > 0 ? (earnedPoints / possiblePoints) * 100 : 0;

          return (
            <div
              key={category.id}
              className="rounded-lg border border-border p-4 bg-card"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">{category.label}</h3>
                <span className="text-sm font-semibold text-muted-foreground">
                  {earnedPoints}/{possiblePoints} pts
                </span>
              </div>

              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {percentage.toFixed(0)}% complete
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
