import ScenarioLayout from "@/components/scenario/scenario";
import { Scenario } from "@/types/scenario";

const ScenarioData: Scenario = {
  id: "nuclear-plant",
  name: "Nuclear Plant",
  description: "A detailed simulation of a nuclear power plant.",
  curriculum: `
  [
    {
      "title": "Flag from the Firewall",
      "placeholder": "JER-XXXX-XXXX",
      "answer": "JER-2024-0001"
    }
  ]
  `,
  createdAt: "2023-10-01T12:00:00Z",
  topologyMap: "/topology-test.png",
};

export default function ScenarioPage() {
  return <ScenarioLayout scenario={ScenarioData} />;
}
