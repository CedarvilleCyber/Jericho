import ScenarioLayout from "@/components/layout/scenario";
import { Scenario } from "@/types/scenario";

const ScenarioData: Scenario = {
  id: "nuclear-plant",
  name: "Nuclear Plant",
  description: "A detailed simulation of a nuclear power plant.",
  curriculum: "Nuclear Safety and Operations",
  createdAt: "2023-10-01T12:00:00Z",
  topologyMap: "/topology-test.png",
};

export default function ScenarioPage() {
  return <ScenarioLayout scenario={ScenarioData} />;
}
