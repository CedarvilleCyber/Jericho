import { prisma } from "@/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export default async function SkillsMatrix() {
  const { user: authenticatedUser } = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: authenticatedUser.id },
    include: {
      userAnswers: {
        where: { isCorrect: true },
        include: {
          curriculum: {
            select: {
              pointValue: true,
              skillCategories: {  // Changed from skillCategory
                select: {
                  skillCategory: {
                    select: { id: true, label: true }
                  }
                }
              }
            }
          }
        },
      },
    },
  });

  // Fetch all skill categories with ALL their questions
const allCategories = await prisma.skillCategory.findMany({
  include: {
    curriculums: {
      include: {
        curriculum: {
          select: { pointValue: true }
        }
      }
    }
  },
  orderBy: { id: 'asc' }
});
  // Calculate earned points per category
  const earnedMap = new Map<number, number>();
  allCategories.forEach((cat) => {
    earnedMap.set(cat.id, 0);
  });

  // Award points to ALL categories each question belongs to
  user.userAnswers.forEach((answer) => {
    answer.curriculum.skillCategories.forEach((sc) => {
      const current = earnedMap.get(sc.skillCategory.id) || 0;
      earnedMap.set(sc.skillCategory.id, current + answer.curriculum.pointValue);
    });
  });

  // Calculate total points
  //const totalPoints = Array.from(earnedMap.values()).reduce((sum, p) => sum + p, 0);

  return (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">Skills Matrix</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allCategories.map((category) => {
        const earnedPoints = earnedMap.get(category.id) || 0;
        const possiblePoints = category.curriculums.reduce((sum, sc) => sum + sc.curriculum.pointValue, 0);  // Changed
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
