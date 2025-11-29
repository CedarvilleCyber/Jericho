// app/api/camera/stream/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const STREAM_URL =
    process.env.LIVESTREAM_URL ?? "http://127.0.0.1:8080/stream";

  let upstream: Response;
  const aborter = new AbortController();

  try {
    upstream = await fetch(STREAM_URL, {
      cache: "no-store",
      signal: aborter.signal,
      // If you protected uStreamer with Basic auth, add it here:
      // headers: { Authorization: "Basic " + Buffer.from("user:pass").toString("base64") },
      // @ts-expect-error allow streaming bodies
      duplex: "half",
    });
  } catch {
    return new Response("Upstream unreachable", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  const { readable, writable } = new TransformStream();
  upstream.body.pipeTo(writable).catch(() => aborter.abort());

  const contentType =
    upstream.headers.get("content-type") ??
    "multipart/x-mixed-replace; boundary=--frame";

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": 'inline; filename="stream.mjpg"',
    },
  });
}
