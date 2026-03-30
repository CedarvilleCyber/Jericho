export type TopologyNode = {
  id: string;
  label: string;
  ip?: string;
  revealOrder: number;
};

export type TopologyEdge = {
  id: string;
  source: string;
  target: string;
};

export type Topology = {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
};

export const EMPTY_TOPOLOGY: Topology = { nodes: [], edges: [] };

export function parseTopology(json: unknown): Topology {
  if (!json || typeof json !== "object") return EMPTY_TOPOLOGY;
  const t = json as Record<string, unknown>;
  return {
    nodes: Array.isArray(t.nodes) ? t.nodes : [],
    edges: Array.isArray(t.edges) ? t.edges : [],
  };
}
