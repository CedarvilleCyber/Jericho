"use client";

import { useEffect, useRef } from "react";
import { IconExternalLink } from "@tabler/icons-react";

export default function FlvPlayer({
  streamKey,
  label,
}: {
  streamKey: string;
  label: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const srsBase = process.env.NEXT_PUBLIC_SRS_BASE_URL ?? "";
  const flvUrl = `${srsBase}/live/${streamKey}.flv`;

  useEffect(() => {
    let player: { attachMediaElement(el: HTMLVideoElement): void; load(): void; destroy(): void } | null = null;

    async function init() {
      const flvjs = (await import("flv.js")).default;
      if (!flvjs.isSupported() || !videoRef.current) return;

      player = flvjs.createPlayer({ type: "flv", url: flvUrl, isLive: true });
      player.attachMediaElement(videoRef.current);
      player.load();
    }

    init();

    return () => {
      if (player) {
        player.destroy();
        player = null;
      }
    };
  }, [flvUrl]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
            <h3 className="text-lg font-bold tracking-tight">{label}</h3>
          </div>
          <a
            href={flvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40"
            aria-label={`Open ${label} in new window`}
          >
            <IconExternalLink size={16} />
            <span className="hidden sm:inline">Open</span>
          </a>
        </div>

        <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-xl">
          <div className="relative pt-[56.25%]">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full"
              controls
              autoPlay
              muted
            />
          </div>
        </div>

        <div className="mt-4 flex items-center text-xs text-base-content/50">
          <span className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Now playing
          </span>
        </div>
      </div>
    </div>
  );
}
