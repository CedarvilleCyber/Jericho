// app/console/[node]/[vmid]/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
// noVNC ESM entry:
import RFB from "@novnc/novnc/core/rfb";

export default function ConsolePage({ params }: { params: { node: string; vmid: string } }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rfb, setRfb] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/console/qemu/${encodeURIComponent(params.node)}/${encodeURIComponent(params.vmid)}`, {
          method: "POST",
        });
        if (!res.ok) throw new Error(`Failed to get console URL (${res.status})`);
        const { wsUrl } = await res.json();

        if (cancelled) return;
        const el = canvasRef.current!;
        const url = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + wsUrl;

        const rfb = new RFB(el, url, {
          // Optional: credentials if you’ve set them in PVE (usually not needed for vncproxy)
          // credentials: { username: "", password: "" }
        });
        rfb.viewOnly = false; // allow keyboard/mouse
        rfb.scaleViewport = true;
        setRfb(rfb);
      } catch (e: any) {
        setError(e.message || "Failed to initialize console");
      }
    })();

    return () => {
      cancelled = true;
      try { rfb?.disconnect(); } catch {}
    };
  }, [params.node, params.vmid]);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-2">Console: {params.node}/{params.vmid}</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div
        ref={canvasRef}
        style={{ width: "100%", height: "70vh", background: "#000" }}
      />
    </div>
  );
}
