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
  console.log("🔐 Creating access ticket for user:", PVE_USER);
  console.log("🌐 PVE Base URL:", BASE);
  console.log("🔓 Insecure mode:", INSECURE);
  
  const form = new URLSearchParams({ username: PVE_USER, password: PVE_PASS });
  
  try {
    const res = await axios.post(`${BASE}/access/ticket`, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      httpsAgent,
      timeout: 30_000,
    });
    
    console.log("✅ Access ticket created successfully");
    console.log("📋 Ticket length:", res.data.data.ticket?.length || 0);
    console.log("🛡️ CSRF token length:", res.data.data.CSRFPreventionToken?.length || 0);
    
    return res.data.data as AccessTicket;
  } catch (error) {
    console.error("❌ Failed to create access ticket:", error);
    throw error;
  }
}

// IMPORTANT: use the same cookie/CSRF for vncproxy (not the API token client)
async function createVncProxyWithCookie(node: string, vmid: string, auth: AccessTicket): Promise<VncResp> {
  console.log(`🖥️ Creating VNC proxy for node: ${node}, VM: ${vmid}`);
  console.log("🍪 Using cookie length:", auth.ticket?.length || 0);
  console.log("🛡️ Using CSRF token length:", auth.CSRFPreventionToken?.length || 0);
  
  const url = `${BASE}/nodes/${encodeURIComponent(node)}/qemu/${encodeURIComponent(vmid)}/vncproxy`;
  console.log("📡 VNC proxy URL:", url);
  
  try {
    const res = await axios.post(
      url,
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
    
    console.log("✅ VNC proxy created successfully");
    console.log("🔌 VNC port:", res.data.data.port);
    console.log("🎫 VNC ticket length:", res.data.data.ticket?.length || 0);
    
    return res.data.data as VncResp;
  } catch (error) {
    console.error("❌ Failed to create VNC proxy:", error);
    throw error;
  }
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ node: string; vmid: string }> }
) {
  console.log("🚀 Starting console initialization");
  
  try {
    const session = await auth();
    console.log("👤 Session check - User ID:", session?.user?.id || "none");
    
    if (!session?.user?.id) {
      console.log("❌ Unauthorized - no user session");
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const { node, vmid } = await context.params;
    console.log(`📋 Parameters - Node: ${node}, VM ID: ${vmid}`);

    // 1) Login (password) to get cookie+CSRF for SAME user
    console.log("📝 Step 1: Creating access ticket...");
    const authTick = await createAccessTicket();

    // 2) Create VNC proxy using THAT cookie+CSRF
    console.log("📝 Step 2: Creating VNC proxy...");
    const vnc = await createVncProxyWithCookie(node, vmid, authTick); // { port, ticket }

    // 3) One-time stash of the cookie; proxy will fetch and consume it
    console.log("📝 Step 3: Saving cookie to session store...");
    const jti = crypto.randomUUID();
    console.log("🆔 Generated JTI:", jti);
    await saveCookie(jti, authTick.ticket);
    console.log("✅ Cookie saved successfully");

    // 4) Short-lived JWT for the browser -> WS proxy
    console.log("📝 Step 4: Creating JWT token...");
    const tokenPayload = { 
      sub: session.user.id, 
      jti, 
      node, 
      vmid, 
      port: vnc.port, 
      vncticket: vnc.ticket 
    };
    console.log("🎫 JWT payload:", { ...tokenPayload, vncticket: `[${vnc.ticket.length} chars]` });
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "60s" });
    console.log("✅ JWT token created successfully");

    const response = {
      wsUrl: `/console/ws?token=${encodeURIComponent(token)}`,
      vncPassword: vnc.ticket,
    };
    
    console.log("🎉 Console initialization completed successfully");
    console.log("📤 Response:", { ...response, vncPassword: `[${vnc.ticket.length} chars]` });

    return Response.json(response);
  } catch (e: any) {
    console.error("💥 Console initialization failed:", e);
    console.error("📊 Error details:", {
      message: e?.message,
      code: e?.code,
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      data: e?.response?.data
    });
    
    return Response.json({ error: e?.message || "console-init-failed" }, { status: 500 });
  }
}
