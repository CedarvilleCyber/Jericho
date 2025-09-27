// app/api/console/qemu/[node]/[vmid]/route.ts
export const runtime = "nodejs";

import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { saveCookie } from "@/app/api/console/session-store";

import axios from "axios";
import https from "https";

const JWT_SECRET = process.env.CONSOLE_JWT_SECRET!;
const PVE_USER = process.env.PVE_USER!;
const PVE_PASS = process.env.PVE_PASS!; // <- match your .env
const BASE = `${process.env.PVE_HOST}/api2/json`;
const INSECURE = process.env.PVE_INSECURE === "true";
const httpsAgent = new https.Agent({ rejectUnauthorized: !INSECURE });

type AccessTicket = { ticket: string; CSRFPreventionToken: string };
type VncResp = { port: number; ticket: string };

async function createAccessTicket(): Promise<AccessTicket> {
  const form = new URLSearchParams({ username: PVE_USER, password: PVE_PASS });
  const res = await axios.post(`${BASE}/access/ticket`, form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    httpsAgent,
    timeout: 30_000,
  });
  return res.data.data as AccessTicket;
}

// IMPORTANT: use the same cookie/CSRF for vncproxy (not the API token client)
async function createVncProxyWithCookie(node: string, vmid: string, auth: AccessTicket): Promise<VncResp> {
  const res = await axios.post(
    `${BASE}/nodes/${encodeURIComponent(node)}/qemu/${encodeURIComponent(vmid)}/vncproxy`,
    { websocket: 1 },
    {
      httpsAgent,
      timeout: 30_000,
      headers: {
        Cookie: `PVEAuthCookie=${auth.ticket}`,
        CSRFPreventionToken: auth.CSRFPreventionToken,
      },
    }
  );
  return res.data.data as VncResp;
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ node: string; vmid: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const { node, vmid } = await context.params;

    // 1) Login (password) to get cookie+CSRF for SAME user
    const authTick = await createAccessTicket();

    // 2) Create VNC proxy using THAT cookie+CSRF
    const vnc = await createVncProxyWithCookie(node, vmid, authTick); // { port, ticket }

    // 3) One-time stash of the cookie; proxy will fetch and consume it
    const jti = crypto.randomUUID();
    await saveCookie(jti, authTick.ticket);

    // 4) Short-lived JWT for the browser -> WS proxy
    const token = jwt.sign(
      { sub: session.user.id, jti, node, vmid, port: vnc.port, vncticket: vnc.ticket },
      JWT_SECRET,
      { expiresIn: "60s" }
    );

    // ⬅ add vncPassword
    return Response.json({
      wsUrl: `/console/ws?token=${encodeURIComponent(token)}`,
      vncPassword: vnc.ticket,
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || "console-init-failed" }, { status: 500 });
  }
}
