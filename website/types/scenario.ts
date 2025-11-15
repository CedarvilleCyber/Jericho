import { Curriculum, Scenario } from "@prisma/client";

export interface ScenarioWithQuestions extends Scenario {
  questions: Array<Curriculum>;
}
