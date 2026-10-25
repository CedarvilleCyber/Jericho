"use client";

import { useState } from "react";
import FlvPlayer from "./flv-player";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconLayoutColumns,
  IconMaximize,
} from "@tabler/icons-react";

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

function StreamArrows({ onStep }: { onStep: (dir: 1 | -1) => void }) {
  return (
    <div className="join">
      <button
        className="join-item btn btn-sm btn-ghost"
        onClick={() => onStep(-1)}
        title="Previous stream"
        aria-label="Previous stream"
      >
        <IconChevronLeft size={16} />
      </button>
      <button
        className="join-item btn btn-sm btn-ghost"
        onClick={() => onStep(1)}
        title="Next stream"
        aria-label="Next stream"
      >
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}

function StreamSelect({
  streams,
  current,
  onSelect,
}: {
  streams: StreamSlot[];
  current: number;
  onSelect: (position: number) => void;
}) {
  return (
    <select
      className="select select-bordered select-sm"
      aria-label="Choose stream"
      value={current}
      onChange={(e) => onSelect(Number(e.target.value))}
    >
      {streams.map((s) => (
        <option key={s.position} value={s.position}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

export function LivestreamViewer({
  configLayout,
  streams,
}: {
  configLayout: number;
  streams: StreamSlot[];
}) {
  const [layout, setLayout] = useState(configLayout);
  // Stream positions in viewing order: 1-up shows order[0], 2-up shows order[0] and order[1].
  const [order, setOrder] = useState(() => streams.map((s) => s.position));

  // Puts a stream in a pane. If the other pane already shows it, the two panes swap.
  function showStream(pane: number, position: number) {
    setOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(position);
      [next[pane], next[from]] = [next[from], next[pane]];
      return next;
    });
  }

  // Moves the single view to the next/previous stream, wrapping around at the ends.
  function step(dir: 1 | -1) {
    const i = streams.findIndex((s) => s.position === order[0]);
    showStream(0, streams[(i + dir + streams.length) % streams.length].position);
  }

  // 4-up always shows streams in their admin-set order.
  const shown = layout === 4 ? streams.map((s) => s.position) : order;
  const slots = Array.from(
    { length: layout },
    (_, i) => streams.find((s) => s.position === shown[i]) ?? null,
  );

  function controlsFor(pane: number, slot: StreamSlot) {
    if (layout === 1 && streams.length > 1) {
      return <StreamArrows onStep={step} />;
    }
    if (layout === 2 && streams.length > 2) {
      return (
        <StreamSelect
          streams={streams}
          current={slot.position}
          onSelect={(position) => showStream(pane, position)}
        />
      );
    }
    return null;
  }

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
        {slots.map((slot, pane) =>
          slot ? (
            <FlvPlayer
              key={slot.position}
              streamKey={slot.streamKey}
              label={slot.label}
              actions={controlsFor(pane, slot)}
            />
          ) : (
            <div
              key={`empty-${pane}`}
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
