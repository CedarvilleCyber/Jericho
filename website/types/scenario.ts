export interface Scenario {
  id: string;
  name: string;
  description: string;
  curriculum: string;
  createdAt: string;
  deletedAt?: string;
  topologyMap: string;
}

export interface ScenarioTag {
  id: string;
  name: string;
  color: string;
}

export interface ScenarioToTag {
  scenarioId: string;
  tagId: string;
}