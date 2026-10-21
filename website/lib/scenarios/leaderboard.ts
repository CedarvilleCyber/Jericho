export const MACHINE_REVEAL_PENALTY = 5;
export const QUESTION_HINT_PENALTY = 2;

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  rawScore: number;
  machinesRevealed: number;
  questionHints: number;
  finalScore: number;
}

interface UserScenarioForLeaderboard {
  userId: string;
  hintsUsed: number;
  user: {
    name: string | null;
    displayUsername: string | null;
  };
}

interface QuestionForLeaderboard {
  answer: string;
  answerIsRegex: boolean;
  type: string;
  pointValue: number;
  userAnswers: { userId: string; answer: string }[];
}

export function isAnswerCorrect(
  userAnswer: string,
  correctAnswer: string,
  type: string,
  answerIsRegex: boolean
): boolean {
  if (type === "INFORMATIONAL") {
    return false;
  }
  const ua = userAnswer.trim();
  const ca = correctAnswer.trim();
  if (type === "NUMERIC") {
    return parseFloat(ua) === parseFloat(ca);
  }
  if (answerIsRegex) {
    try {
      return new RegExp(ca).test(ua);
    } catch {
      return false;
    }
  }
  return ua === ca;
}

export function buildLeaderboardEntries(
  userScenarios: UserScenarioForLeaderboard[],
  questions: QuestionForLeaderboard[],
  userHints: { userId: string }[]
): LeaderboardEntry[] {
  const questionHintsByUser: Record<string, number> = {};
  for (const userHint of userHints) {
    questionHintsByUser[userHint.userId] =
      (questionHintsByUser[userHint.userId] ?? 0) + 1;
  }

  const entries = userScenarios.map((userScenario) => {
    const rawScore = questions.reduce((total, question) => {
      const userAnswer = question.userAnswers.find(
        (answer) => answer.userId === userScenario.userId
      );
      if (!userAnswer) return total;
      return isAnswerCorrect(
        userAnswer.answer,
        question.answer,
        question.type,
        question.answerIsRegex
      )
        ? total + question.pointValue
        : total;
    }, 0);

    const machinesRevealed = userScenario.hintsUsed;
    const questionHints = questionHintsByUser[userScenario.userId] ?? 0;
    const finalScore =
      rawScore -
      machinesRevealed * MACHINE_REVEAL_PENALTY -
      questionHints * QUESTION_HINT_PENALTY;

    return {
      userId: userScenario.userId,
      displayName:
        userScenario.user.displayUsername ?? userScenario.user.name ?? "Unknown",
      rawScore,
      machinesRevealed,
      questionHints,
      finalScore,
    };
  });

  entries.sort(
    (a, b) =>
      b.finalScore - a.finalScore ||
      b.rawScore - a.rawScore ||
      a.machinesRevealed +
        a.questionHints -
        (b.machinesRevealed + b.questionHints)
  );

  return entries.map((entry, index) => ({ rank: index + 1, ...entry }));
}
