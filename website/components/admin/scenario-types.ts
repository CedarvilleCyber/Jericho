import { Question, Scenario, Section, Hint, QuestionType, ScenarioLivestream } from "@/app/generated/prisma/client";

export type QuestionWithSection = Question & { section: Section | null; hints: Hint[] };
export type ScenarioWithQuestions = Scenario & {
  questions: QuestionWithSection[];
  sections: Section[];
  livestreams: ScenarioLivestream[];
};
export { QuestionType };
