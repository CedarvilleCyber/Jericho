import { Handle, Position } from "@xyflow/react";

export function TopologyMachineNode({
  data,
}: {
  data: { label: string; ip?: string };
}) {
  return (
    <div className="bg-base-100 border border-base-300 rounded-lg px-3 py-2 min-w-32.5 shadow-sm text-center">
      <Handle type="target" position={Position.Top} />
      <p className="font-medium text-sm">{data.label}</p>
      {data.ip && (
        <p className="text-xs text-base-content/60 font-mono mt-0.5">{data.ip}</p>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
