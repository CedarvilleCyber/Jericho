// server/console-proxy.js
require("dotenv/config");
const { WebSocketServer, WebSocket } = require("ws");
const https = require("https");
const url = require("url");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");

// --- config
const JWT_SECRET = process.env.CONSOLE_JWT_SECRET;
const RAW_HOST = process.env.PVE_HOST || ""; // e.g. https://pve.example.com:8006
const INSECURE = process.env.PVE_INSECURE === "true";
const ORIGIN = process.env.CONSOLE_ORIGIN || "https://example.org";
const PORT = Number(process.env.CONSOLE_PROXY_PORT || 3088);

// --- normalize host & build base
const hostNoSlash = RAW_HOST.replace(/\/+$/, "");
// We will explicitly add `/api2/json` in the URL we construct below, so RAW_HOST should NOT include it

// --- redis + single-use cookie helper (avoid TS import issues)
const redis = new Redis(process.env.REDIS_URL);
async function takeCookie(jti) {
  const key = `console:${jti}`;
  const cookie = await redis.get(key);
  if (!cookie) return null;
  await redis.del(key);
  return cookie;
}

// --- server
const wss = new WebSocketServer({ port: PORT, path: "/console/ws" });

wss.on("connection", async (client, req) => {
  try {
    const parts = url.parse(req.url, true);
    const token = parts.query.token;
    if (!token) return client.close(1008, "missing token");

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return client.close(1008, "bad token");
    }

    const { jti, node, vmid, port, vncticket } = payload || {};
    if (!jti || !node || !vmid || !port || !vncticket) {
      return client.close(1008, "invalid payload");
    }

    const pveCookie = await takeCookie(jti);
    if (!pveCookie) return client.close(1011, "cookie expired");

    const nodeEnc = encodeURIComponent(String(node));
    const vmidEnc = encodeURIComponent(String(vmid));

    const upstreamUrl =
      `${hostNoSlash}/api2/json/nodes/${nodeEnc}/qemu/${vmidEnc}` +
      `/vncwebsocket?port=${encodeURIComponent(port)}&vncticket=${encodeURIComponent(vncticket)}`;

    const headers = {
      Cookie: `PVEAuthCookie=${pveCookie}`,
      Origin: ORIGIN,
    };
    const agent = new https.Agent({ rejectUnauthorized: !INSECURE });

    const upstream = new WebSocket(upstreamUrl, { headers, agent });

    // wire data once upstream is open
    upstream.on("open", () => {
      client.on("message", (d) => {
        if (upstream.readyState === WebSocket.OPEN) upstream.send(d);
      });
      upstream.on("message", (d) => {
        if (client.readyState === WebSocket.OPEN) client.send(d);
      });
    });

    upstream.on("close", () => {
      try { client.close(); } catch {}
    });
    upstream.on("error", () => {
      try { client.close(1011, "upstream error"); } catch {}
    });
    client.on("close", () => {
      try { upstream.close(); } catch {}
    });
  } catch (e) {
    try { client.close(1011, "proxy error"); } catch {}
  }
});

console.log(`WS proxy listening on :${PORT}/console/ws`);
