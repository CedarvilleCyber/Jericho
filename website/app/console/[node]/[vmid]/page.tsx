// app/console/[node]/[vmid]/page.tsx
"use client";
import RFB from "@novnc/novnc/lib/rfb";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ConsolePage() {
  const { node, vmid } = useParams<{ node: string; vmid: string }>();
  const mountRef = useRef<HTMLDivElement>(null);
  const rfbRef = useRef<RFB | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!node || !vmid) return;
    let cancelled = false;

    (async () => {
      try {
        setError(null);

        // 1) Ask API for a one-time ws token url + VNC password
        const res = await fetch(
          `/api/console/qemu/${encodeURIComponent(node)}/${encodeURIComponent(
            vmid
          )}`,
          { method: "POST" }
        );
        if (!res.ok)
          throw new Error(`Failed to get console URL (${res.status})`);
        const { wsUrl } = await res.json(); // <-- now includes vncPassword

        // 2) Build WS endpoint (supports dev override)
        const base =
          process.env.NEXT_PUBLIC_CONSOLE_WS ||
          (location.protocol === "https:" ? "wss://" : "ws://") +
            location.host +
            "/console/ws";
        const query = wsUrl.includes("?")
          ? wsUrl.slice(wsUrl.indexOf("?"))
          : `?token=${encodeURIComponent(wsUrl)}`;
        const fullUrl = `${base}${query}`;
        console.log("[console] WS URL:", fullUrl);

        if (cancelled || !mountRef.current) return;

        // 4) Connect
        try {
          rfbRef.current?.disconnect?.();
        } catch {}
        const rfb = new RFB(mountRef.current, fullUrl);

        // 🔑 Provide credentials when asked
        rfb.addEventListener("credentialsrequired", () => {
          console.log("[noVNC] credentialsrequired → sending password");
          try {
            rfb.sendCredentials({
              password: process.env.PVE_PASS as string,
              username: process.env.PVE_USER as string,
              target: vmid,
            });
          } catch (e) {
            console.error("[noVNC] sendCredentials failed", e);
          }
        });

        // Optional: helpful logs & tweaks
        rfb.addEventListener("connect", () => console.log("[noVNC] connect"));
        rfb.addEventListener("fbresize", (e) =>
          console.log("[noVNC] fbresize", e.detail.width, e.detail.height)
        );
        rfb.addEventListener("securityfailure", (e) =>
          console.log("[noVNC] securityfailure", e.detail)
        );
        rfb.clipViewport = true;
        rfb.resizeSession = true;
        rfb.viewOnly = false;
        rfb.scaleViewport = true;

        rfbRef.current = rfb;
      } catch (e: unknown) {
        setError((e as Error).message || "Failed to initialize console");
      }
    })();

    return () => {
      cancelled = true;
      try {
        rfbRef.current?.disconnect?.();
      } catch {}
      rfbRef.current = null;
    };
  }, [node, vmid]);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-2">
        Console: {node}/{vmid}
      </h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div
        ref={mountRef}
        style={{ width: "100%", height: "70vh", background: "#000" }}
      />
    </div>
  );
}
