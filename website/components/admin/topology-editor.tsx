"use client";

import { Topology, TopologyEdge, TopologyNode } from "@/lib/scenarios/topology-types";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

function NodeRow({
  node,
  onUpdate,
  onDelete,
}: {
  node: TopologyNode;
  onUpdate: (n: TopologyNode) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
      <input
        className="input input-bordered input-sm flex-1"
        placeholder="Label"
        value={node.label}
        onChange={(e) => onUpdate({ ...node, label: e.target.value })}
      />
      <input
        className="input input-bordered input-sm w-32"
        placeholder="IP (optional)"
        value={node.ip ?? ""}
        onChange={(e) => onUpdate({ ...node, ip: e.target.value || undefined })}
      />
      <div className="flex items-center gap-1">
        <span className="text-xs text-base-content/50">Order</span>
        <input
          type="number"
          className="input input-bordered input-sm w-16"
          min={0}
          value={node.revealOrder}
          onChange={(e) => onUpdate({ ...node, revealOrder: parseInt(e.target.value) || 0 })}
        />
      </div>
      <button type="button" className="btn btn-ghost btn-sm btn-square text-error" onClick={onDelete}>
        <IconTrash size={14} />
      </button>
    </div>
  );
}

function EdgeRow({
  edge,
  nodes,
  onDelete,
}: {
  edge: TopologyEdge;
  nodes: TopologyNode[];
  onDelete: () => void;
}) {
  const src = nodes.find((n) => n.id === edge.source)?.label || edge.source;
  const tgt = nodes.find((n) => n.id === edge.target)?.label || edge.target;
  return (
    <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
      <span className="text-sm flex-1">{src} → {tgt}</span>
      <button type="button" className="btn btn-ghost btn-sm btn-square text-error" onClick={onDelete}>
        <IconTrash size={14} />
      </button>
    </div>
  );
}

function AddEdgeRow({
  nodes,
  onAdd,
}: {
  nodes: TopologyNode[];
  onAdd: (e: Omit<TopologyEdge, "id">) => void;
}) {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");

  function handleAdd() {
    if (!source || !target) return;
    onAdd({ source, target });
    setSource("");
    setTarget("");
  }

  return (
    <div className="flex items-center gap-2">
      <select className="select select-bordered select-sm flex-1" value={source} onChange={(e) => setSource(e.target.value)}>
        <option value="">From...</option>
        {nodes.map((n) => <option key={n.id} value={n.id}>{n.label || n.id}</option>)}
      </select>
      <span className="text-sm">→</span>
      <select className="select select-bordered select-sm flex-1" value={target} onChange={(e) => setTarget(e.target.value)}>
        <option value="">To...</option>
        {nodes.filter((n) => n.id !== source).map((n) => <option key={n.id} value={n.id}>{n.label || n.id}</option>)}
      </select>
      <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={handleAdd} disabled={!source || !target}>
        <IconPlus size={14} />
      </button>
    </div>
  );
}

export function TopologyEditor({
  value,
  onChange,
}: {
  value: Topology;
  onChange: (t: Topology) => void;
}) {
  function addNode() {
    onChange({
      ...value,
      nodes: [...value.nodes, { id: crypto.randomUUID(), label: "", revealOrder: 0 }],
    });
  }

  function updateNode(id: string, updated: TopologyNode) {
    onChange({ ...value, nodes: value.nodes.map((n) => (n.id === id ? updated : n)) });
  }

  function deleteNode(id: string) {
    onChange({
      nodes: value.nodes.filter((n) => n.id !== id),
      edges: value.edges.filter((e) => e.source !== id && e.target !== id),
    });
  }

  function addEdge(e: Omit<TopologyEdge, "id">) {
    onChange({ ...value, edges: [...value.edges, { id: crypto.randomUUID(), ...e }] });
  }

  function deleteEdge(id: string) {
    onChange({ ...value, edges: value.edges.filter((e) => e.id !== id) });
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="label-text font-semibold">Topology Nodes</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={addNode}>
            <IconPlus size={16} /> Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {value.nodes.length === 0 && <p className="text-sm text-base-content/50">No nodes yet. Order 0 = always visible (attacker).</p>}
          {value.nodes.map((n) => (
            <NodeRow key={n.id} node={n} onUpdate={(u) => updateNode(n.id, u)} onDelete={() => deleteNode(n.id)} />
          ))}
        </div>
      </div>

      {value.nodes.length >= 2 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="label-text font-semibold">Topology Edges</span>
          </div>
          <div className="flex flex-col gap-2">
            {value.edges.map((e) => (
              <EdgeRow key={e.id} edge={e} nodes={value.nodes} onDelete={() => deleteEdge(e.id)} />
            ))}
            <AddEdgeRow nodes={value.nodes} onAdd={addEdge} />
          </div>
        </div>
      )}
    </div>
  );
}
