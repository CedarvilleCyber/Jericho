export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSessionFromRequest } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request.headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const SNAP_URL =
    process.env.LIVESTREAM_SNAPSHOT_URL ?? "http://127.0.0.1:8080/snapshot";

  const upstream = await fetch(SNAP_URL, { cache: "no-store" });

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": 'inline; filename="snapshot.jpg"',
    },
  });
}
