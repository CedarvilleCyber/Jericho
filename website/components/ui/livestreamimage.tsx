// components/livestreamimage.tsx
"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

type State =
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "unauth" } // 401 not signed in
  | { kind: "forbidden" } // 403 signed in but no permission
  | { kind: "error"; msg: string };

export default function LiveStreamImage({
  height = "28rem",
}: {
  height?: string;
}) {
  return (
    <iframe
      src="https://jericho.alexthetaylor.com/stream"
      className="w-full h-full border-0 rounded-md shadow-lg"
      style={{ height }}
    ></iframe>
  );
  //   const [state, setState] = useState<State>({ kind: "loading" });
  //   const [imgSrc, setImgSrc] = useState("/webapp/api/camera/stream");

  // useEffect(() => {
  //   let cancelled = false;

  //   (async () => {
  //     try {
  //       const r = await fetch("/webapp/api/camera/status", { cache: "no-store" });

  //       if (cancelled) return;

  //       // Decide purely from HTTP status (no need for a body)
  //       if (r.status === 200) {
  //         setState({ kind: "ok" });
  //         return;
  //       }
  //       if (r.status === 401) {
  //         setState({ kind: "unauth" });
  //         return;
  //       }
  //       if (r.status === 403) {
  //         setState({ kind: "forbidden" });
  //         return;
  //       }

  //       // Optional: if it's 200 but you still want to verify JSON { ok: true }
  //       // const ct = r.headers.get("content-type") || "";
  //       // if (ct.includes("application/json")) {
  //       //   const { ok } = await r.json();
  //       //   setState(ok ? { kind: "ok" } : { kind: "error", msg: "bad body" });
  //       //   return;
  //       // }

  //       setState({ kind: "error", msg: `status ${r.status}` });
  //     } catch (e) {
  //       if (!cancelled) setState({ kind: "error", msg: String(e) });
  //     }
  //   })();

  //   return () => { cancelled = true; };
  // }, []);

  //   const retry = () => {
  //     const sep = imgSrc.includes("?") ? "&" : "?";
  //     setImgSrc(`${imgSrc}${sep}t=${Date.now()}`);
  //   };

  //   return (
  //     // inside LiveStreamTile render
  // // inside LiveStreamTile render
  // <div
  //   className={
  //     // when locked, add "dark" to scope the dark variant just here
  //     `relative w-full rounded-md overflow-hidden border shadow
  //      ${state.kind === "ok" ? "" : "dark"}`
  //   }
  //   style={{ height }}
  // >
  //   {state.kind === "ok" && (
  //     <img
  //       src={imgSrc}
  //       alt="Live stream"
  //       className="h-full w-full object-contain bg-black"
  //       onError={retry}
  //     />
  //   )}

  //   {state.kind === "loading" && (
  //     <div className="h-full w-full animate-pulse bg-neutral-100 dark:bg-neutral-900" />
  //   )}

  //   {(state.kind === "unauth" || state.kind === "forbidden") && (
  //     <LockedPoster
  //       kind={state.kind === "unauth" ? "unauth" : "forbidden"}
  //     />
  //   )}

  //   {state.kind === "error" && (
  //     <div className="h-full w-full bg-neutral-100 dark:bg-neutral-900
  //                     text-neutral-700 dark:text-neutral-200
  //                     flex items-center justify-center text-sm">
  //       Failed to load stream ({state.msg})
  //     </div>
  //   )}
  // </div>

  //   );
}

function LockedPoster({ kind }: { kind: "unauth" | "forbidden" }) {
  const msg =
    kind === "unauth" ? "Sign in to view the live stream" : "Access required";
  const ctaHref = kind === "unauth" ? "/api/auth/signin" : "/request-access";

  return (
    <div
      className="relative h-full w-full
                    bg-white dark:bg-black
                    text-neutral-800 dark:text-neutral-200"
    >
      {/* subtle border on black */}
      <div
        className="absolute inset-0 pointer-events-none
                      border border-neutral-200 dark:border-white/10 rounded-md"
      />

      {/* center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">
            {msg}
          </span>
        </div>
      </div>
    </div>
  );
}
