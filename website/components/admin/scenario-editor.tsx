import { ScenarioCard } from "@/components/admin/scenario-card";
import { ScenarioWithQuestions } from "@/components/admin/scenario-types";

export default function ScenarioEditor({ scenario }: { scenario: ScenarioWithQuestions }) {
  return <ScenarioCard scenario={scenario} />;
}
