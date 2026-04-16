"use client";

import { useState } from "react";
import FlvPlayer from "./flv-player";
import { IconLayoutGrid, IconLayoutColumns, IconMaximize } from "@tabler/icons-react";

interface StreamSlot {
  position: number;
  streamKey: string;
  label: string;
}

const LAYOUT_OPTIONS = [
  { value: 1, icon: IconMaximize, title: "1-up" },
  { value: 2, icon: IconLayoutColumns, title: "2-up" },
  { value: 4, icon: IconLayoutGrid, title: "4-up" },
];

const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  4: "grid-cols-2",
};

export function LivestreamViewer({
  configLayout,
  streams,
}: {
  configLayout: number;
  streams: StreamSlot[];
}) {
  const [layout, setLayout] = useState(configLayout);

  const slots = Array.from({ length: layout }, (_, i) => {
    return streams.find((s) => s.position === i) ?? null;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Livestream</h1>
        <div className="join">
          {LAYOUT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                className={`join-item btn btn-sm${layout === opt.value ? " btn-primary" : " btn-ghost"}`}
                onClick={() => setLayout(opt.value)}
                title={opt.title}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      <div className={`grid ${GRID_CLASS[layout]} gap-4`}>
        {slots.map((slot, i) =>
          slot ? (
            <FlvPlayer key={slot.position} streamKey={slot.streamKey} label={slot.label} />
          ) : (
            <div
              key={i}
              className="rounded-2xl border border-base-300 bg-base-200 flex items-center justify-center"
              style={{ aspectRatio: "16/9" }}
            >
              <p className="text-sm text-base-content/40">No stream assigned</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
