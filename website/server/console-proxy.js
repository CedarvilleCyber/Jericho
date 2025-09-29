// server/console-proxy.js
import "dotenv/config";
import Redis from "ioredis";
import { verify } from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";

// --- config
const JWT_SECRET = process.env.CONSOLE_JWT_SECRET;
const RAW_HOST = process.env.PVE_HOST || ""; // e.g. https://pve.example.com:8006
const INSECURE = process.env.PVE_INSECURE === "true";
const ORIGIN = process.env.CONSOLE_ORIGIN || "https://example.org";
const PORT = Number(process.env.CONSOLE_PROXY_PORT || 3088);

// Set NODE_TLS_REJECT_UNAUTHORIZED=0 when using self-signed certs
if (INSECURE) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log(
    "[proxy] Set NODE_TLS_REJECT_UNAUTHORIZED=0 for self-signed certificates"
  );
}

console.log("[proxy] Starting console proxy server");
console.log("[proxy] Config:", {
  host: RAW_HOST,
  insecure: INSECURE,
  origin: ORIGIN,
  port: PORT,
});

// --- normalize host & build base
const hostNoSlash = RAW_HOST.replace(/\/+$/, "");
// We will explicitly add `/api2/json` in the URL we construct below, so RAW_HOST should NOT include it

// --- redis + single-use cookie helper (avoid TS import issues)
const redis = new Redis(process.env.REDIS_URL);
console.log("[proxy] Redis client initialized");

async function takeCookie(jti) {
  console.log("[proxy] Attempting to retrieve cookie for jti:", jti);
  const key = `console:${jti}`;
  const cookie = await redis.get(key);
  if (!cookie) {
    console.log("[proxy] No cookie found for jti:", jti);
    return null;
  }
  await redis.del(key);
  console.log("[proxy] Cookie retrieved and deleted for jti:", jti);
  return cookie;
}

// --- server
const wss = new WebSocketServer({ port: PORT, path: "/console/ws" });

wss.on("connection", async (client, req) => {
  const clientId = Math.random().toString(36).substr(2, 9);
  console.log(
    `[proxy] Client ${clientId} connected from ${req.socket.remoteAddress}`,
    req.url
  );

  try {
    const u = new URL(req.url, `http://${req.headers.host}`);
    const token = u.searchParams.get("token");

    if (!token) {
      console.log(`[proxy] Client ${clientId} missing token`);
      return client.close(1008, "missing token");
    }

    console.log(`[proxy] Client ${clientId} verifying JWT token`);
    let payload;
    try {
      payload = verify(token, JWT_SECRET);
      console.log(`[proxy] Client ${clientId} token verified successfully`);
    } catch (e) {
      console.log(`[proxy] Client ${clientId} token verify error:`, e.message);
      return client.close(1008, "bad token");
    }

    const { jti, node, vmid, port, vncticket } = payload || {};
    console.log(`[proxy] Client ${clientId} payload:`, {
      jti,
      node,
      vmid,
      port,
      vncticket: vncticket ? "[REDACTED]" : undefined,
    });

    if (!jti || !node || !vmid || !port || !vncticket) {
      console.log(
        `[proxy] Client ${clientId} invalid payload - missing required fields`
      );
      return client.close(1008, "invalid payload");
    }

    const pveCookie = await takeCookie(jti);
    if (!pveCookie) {
      console.log(`[proxy] Client ${clientId} cookie expired or not found`);
      return client.close(1011, "cookie expired");
    }

    const nodeEnc = encodeURIComponent(String(node));
    const vmidEnc = encodeURIComponent(String(vmid));

    // Convert HTTP(S) to WS(S) for WebSocket connection
    const wsHost = hostNoSlash
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    const upstreamUrl =
      `${wsHost}/api2/json/nodes/${nodeEnc}/qemu/${vmidEnc}` +
      `/vncwebsocket?port=${encodeURIComponent(
        port
      )}&vncticket=${encodeURIComponent(vncticket)}`;

    console.log(
      `[proxy] Client ${clientId} connecting to upstream:`,
      upstreamUrl.replace(/vncticket=[^&]+/, "vncticket=[REDACTED]")
    );
    console.log(`[proxy] Client ${clientId} INSECURE setting:`, INSECURE);

    const headers = {
      Cookie: `PVEAuthCookie=${pveCookie}`,
      Origin: ORIGIN,
    };

    const wsOptions = {
      headers,
    };

    // TLS configuration is handled globally via NODE_TLS_REJECT_UNAUTHORIZED
    console.log(
      `[proxy] Client ${clientId} using TLS mode: ${
        INSECURE
          ? "INSECURE (accepting self-signed)"
          : "SECURE (validating certs)"
      }`
    );
    console.log(
      `[proxy] Client ${clientId} NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`
    );

    const upstream = new WebSocket(upstreamUrl, wsOptions);

    upstream.on("open", () => {
      console.log(`[proxy] Client ${clientId} upstream connection established`);

      client.on("message", (d) => {
        console.log(
          `[proxy] Client ${clientId} -> upstream: ${d.length} bytes`
        );
        if (upstream.readyState === WebSocket.OPEN) {
          upstream.send(d);
        } else {
          console.log(
            `[proxy] Client ${clientId} upstream not ready for message (state: ${upstream.readyState})`
          );
        }
      });

      upstream.on("message", (d) => {
        console.log(
          `[proxy] Client ${clientId} <- upstream: ${d.length} bytes`
        );
        if (client.readyState === WebSocket.OPEN) {
          client.send(d);
        } else {
          console.log(
            `[proxy] Client ${clientId} client not ready for message (state: ${client.readyState})`
          );
        }
      });
    });

    upstream.on("close", (code, reason) => {
      console.log(
        `[proxy] Client ${clientId} upstream closed:`,
        code,
        reason?.toString()
      );
      try {
        client.close();
      } catch (e) {
        console.log(
          `[proxy] Client ${clientId} error closing client:`,
          e.message
        );
      }
    });

    upstream.on("error", (error) => {
      console.log(`[proxy] Client ${clientId} upstream error:`, error.message);
      try {
        client.close(1011, "upstream error");
      } catch (e) {
        console.log(
          `[proxy] Client ${clientId} error closing client after upstream error:`,
          e.message
        );
      }
    });

    client.on("close", (code, reason) => {
      console.log(
        `[proxy] Client ${clientId} disconnected:`,
        code,
        reason?.toString()
      );
      try {
        upstream.close();
      } catch (e) {
        console.log(
          `[proxy] Client ${clientId} error closing upstream:`,
          e.message
        );
      }
    });

    client.on("error", (error) => {
      console.log(`[proxy] Client ${clientId} error:`, error.message);
    });
  } catch (e) {
    console.log(`[proxy] Client ${clientId} proxy error:`, e.message);
    try {
      client.close(1011, "proxy error");
    } catch (closeError) {
      console.log(
        `[proxy] Client ${clientId} error closing client after proxy error:`,
        closeError.message
      );
    }
  }
});

console.log(`[proxy] WS proxy listening on :${PORT}/console/ws`);
