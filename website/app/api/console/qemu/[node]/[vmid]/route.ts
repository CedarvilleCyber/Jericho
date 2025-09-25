// app/api/console/qemu/[node]/[vmid]/route.ts
export const runtime = "nodejs";

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { auth } from "@/auth"; // ← import auth() from your auth.ts
import { pve, unwrap } from "@/lib/pve";
import { saveCookie } from "@/app/api/console/session-store"; // adjust if your path differs

const JWT_SECRET = process.env.CONSOLE_JWT_SECRET!;
const PVE_USER = process.env.PVE_USER!;
const PVE_PASS = process.env.PVE_PASS!;

async function createVncProxy(node: string, vmid: string) {
  const res = await pve.post(
    `/nodes/${encodeURIComponent(node)}/qemu/${encodeURIComponent(vmid)}/vncproxy`,
    { websocket: 1 }
  );
  return unwrap(res.data) as { port: number; ticket: string };
}

async function createAccessTicket() {
  const form = new URLSearchParams({ username: PVE_USER, password: PVE_PASS });
  const res = await pve.post(`/access/ticket`, form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return unwrap(res.data) as { ticket: string };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { node: string; vmid: string } }
) {
  // ✅ v5 style
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // TODO: replace with your real RBAC check (pools/tags or your own mapping)
  // For now, allow any authenticated user or implement your rule here:
  // if (!userCanAccessVm(session.user.id, params.node, Number(params.vmid))) {
  //   return Response.json({ error: "forbidden" }, { status: 403 });
  // }

  const { node, vmid } = params;

  const vnc = await createVncProxy(node, vmid); // -> { port, ticket }
  const ticket = await createAccessTicket();     // -> { ticket: PVEAuthCookie }

  const jti = crypto.randomUUID();
  await saveCookie(jti, ticket.ticket); // store PVEAuthCookie server-side (Redis/session store)

  const token = jwt.sign(
    {
      sub: session.user.id, // Entra OID from your auth callbacks
      jti,
      node,
      vmid,
      port: vnc.port,
      vncticket: vnc.ticket,
    },
    JWT_SECRET,
    { expiresIn: "60s" }
  );

  return Response.json({ wsUrl: `/console/ws?token=${encodeURIComponent(token)}` });
}
