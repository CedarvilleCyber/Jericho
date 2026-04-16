"use client";

import { useState } from "react";
import { updateLivestreamPageConfig } from "@/app/admin/livestream/actions";

interface StreamSlot {
  position: number;
  streamKey: string;
  label: string;
}

interface LivestreamPageConfig {
  id: string;
  layout: number;
  streams: StreamSlot[];
}

const LAYOUT_OPTIONS = [
  { value: 1, label: "1-up", description: "Single stream" },
  { value: 2, label: "2-up", description: "Two streams side by side" },
  { value: 4, label: "4-up", description: "Four streams in a 2×2 grid" },
];

function buildDefaultSlots(layout: number, existing: StreamSlot[]): StreamSlot[] {
  return Array.from({ length: layout }, (_, i) => {
    const found = existing.find((s) => s.position === i);
    return found ?? { position: i, streamKey: "", label: `Stream ${i + 1}` };
  });
}

export function LivestreamPageEditor({ config }: { config: LivestreamPageConfig | null }) {
  const [layout, setLayout] = useState(config?.layout ?? 1);
  const [slots, setSlots] = useState<StreamSlot[]>(
    buildDefaultSlots(config?.layout ?? 1, config?.streams ?? []),
  );
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  function handleLayoutChange(newLayout: number) {
    setLayout(newLayout);
    setSlots(buildDefaultSlots(newLayout, slots));
  }

  function updateSlot(position: number, field: "streamKey" | "label", value: string) {
    setSlots((prev) =>
      prev.map((s) => (s.position === position ? { ...s, [field]: value } : s)),
    );
  }

  async function handleSave() {
    setSaving(true);
    await updateLivestreamPageConfig(layout, slots);
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-md">
      <div className="card-body flex flex-col gap-6">
        <div>
          <div className="label"><span className="label-text font-semibold">Layout</span></div>
          <div className="flex gap-3">
            {LAYOUT_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="radio radio-primary"
                  name="layout"
                  value={opt.value}
                  checked={layout === opt.value}
                  onChange={() => handleLayoutChange(opt.value)}
                />
                <div>
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-xs text-base-content/50 ml-1">({opt.description})</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="label"><span className="label-text font-semibold">Stream Slots</span></div>
          <div className="flex flex-col gap-3">
            {slots.map((slot) => (
              <div key={slot.position} className="flex items-center gap-3 bg-base-200 rounded-lg px-3 py-2">
                <span className="text-sm text-base-content/50 w-16">Slot {slot.position + 1}</span>
                <label className="form-control flex-1">
                  <input
                    className="input input-bordered input-sm w-full"
                    value={slot.label}
                    onChange={(e) => updateSlot(slot.position, "label", e.target.value)}
                    placeholder="Label"
                  />
                </label>
                <label className="form-control flex-1">
                  <input
                    className="input input-bordered input-sm w-full font-mono"
                    value={slot.streamKey}
                    onChange={(e) => updateSlot(slot.position, "streamKey", e.target.value)}
                    placeholder="Stream key (e.g. scenario1_cam1)"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end items-center gap-3">
          {savedMsg && <span className="text-sm text-success">Saved!</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-sm" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
