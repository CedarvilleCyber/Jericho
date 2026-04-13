import { Question, Scenario, Section, Hint, QuestionType } from "@/app/generated/prisma/client";

export type QuestionWithSection = Question & { section: Section | null; hints: Hint[] };
export type ScenarioWithQuestions = Scenario & {
  questions: QuestionWithSection[];
  sections: Section[];
};
export { QuestionType };
