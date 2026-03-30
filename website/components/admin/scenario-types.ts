import { Question, Scenario, Section, QuestionType } from "@/app/generated/prisma/client";

export type QuestionWithSection = Question & { section: Section | null };
export type ScenarioWithQuestions = Scenario & {
  questions: QuestionWithSection[];
  sections: Section[];
};
export { QuestionType };
