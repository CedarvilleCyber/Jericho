"use client";

import { useHint } from "@/lib/scenarios/hint";
import { Topology, TopologyNode } from "@/lib/scenarios/topology-types";
import { ReactFlow, useReactFlow, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TopologyMachineNode } from "./topology-node";
import { useEffect, useTransition } from "react";
import { useTheme } from "@/lib/use-theme";

const NODE_TYPES = { machine: TopologyMachineNode };

function buildPositions(
  nodes: TopologyNode[],
): Map<string, { x: number; y: number }> {
  const groups = new Map<number, TopologyNode[]>();
  for (const n of nodes) {
    const g = groups.get(n.revealOrder) ?? [];
    g.push(n);
    groups.set(n.revealOrder, g);
  }
  const positions = new Map<string, { x: number; y: number }>();
  [...groups.keys()]
    .sort((a, b) => a - b)
    .forEach((order, row) => {
      const group = groups.get(order)!;
      group.forEach((n, col) => {
        positions.set(n.id, {
          x: (col - (group.length - 1) / 2) * 220,
          y: row * 140,
        });
      });
    });
  return positions;
}

function FitViewEffect({ hintsUsed }: { hintsUsed: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    fitView({ duration: 400 });
  }, [hintsUsed, fitView]);
  return null;
}

export default function TopologyViewer({
  topology,
  hintsUsed,
  userScenarioId,
}: {
  topology: Topology;
  hintsUsed: number;
  userScenarioId: string;
}) {
  const [pending, startTransition] = useTransition();
  const { theme } = useTheme();

  const maxRevealOrder = Math.max(
    ...topology.nodes.map((n) => n.revealOrder),
    0,
  );
  const canHint = hintsUsed < maxRevealOrder;

  const revealedIds = new Set(
    topology.nodes.filter((n) => n.revealOrder <= hintsUsed).map((n) => n.id),
  );

  const positions = buildPositions(topology.nodes);

  const rfNodes: Node[] = topology.nodes
    .filter((n) => revealedIds.has(n.id))
    .map((n) => ({
      id: n.id,
      type: "machine",
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      data: { label: n.label, ip: n.ip },
    }));

  const rfEdges: Edge[] = topology.edges
    .filter((e) => revealedIds.has(e.source) && revealedIds.has(e.target))
    .map((e) => ({ id: e.id, source: e.source, target: e.target }));

  function handleHint() {
    startTransition(async () => {
      await useHint(userScenarioId);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-64 w-full border border-base-300 rounded-lg overflow-hidden">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={NODE_TYPES}
          fitView
          colorMode={theme === "business" ? "dark" : "light"}
        >
          <FitViewEffect hintsUsed={hintsUsed} />
        </ReactFlow>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-base-content/60">
          {hintsUsed === 0
            ? "Only your attacker machine is visible."
            : `${hintsUsed} hint${hintsUsed !== 1 ? "s" : ""} used`}
        </span>
        <button
          className="btn btn-sm btn-ghost"
          onClick={handleHint}
          disabled={!canHint || pending}
        >
          {pending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : canHint ? (
            "Reveal next machine"
          ) : (
            "All machines revealed"
          )}
        </button>
      </div>
    </div>
  );
}
