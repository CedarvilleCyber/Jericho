// lib/pve.ts
import axios from "axios";
import https from "https";

/**
 * Required env:
 *  - PVE_HOST:   e.g. https://pve.example.com:8006
 *  - PVE_TOKEN:  api@pve!webapp=<token>   (Proxmox API Token)
 * Optional:
 *  - PVE_INSECURE=true  (accept self-signed certs in dev)
 */

const host = (process.env.PVE_HOST || "").replace(/\/+$/, ""); // trim trailing /
const baseURL = host.endsWith("/api2/json") ? host : `${host}/api2/json`;
const token = process.env.PVE_TOKEN!;
const insecure = process.env.PVE_INSECURE === "true";

export const pve = axios.create({
  baseURL,
  headers: {
    // API token auth (no CSRF token needed)
    Authorization: `PVEAPIToken=${token}`,
  },
  // Node-only: allow self-signed in dev if PVE_INSECURE=true
  httpsAgent: new https.Agent({ rejectUnauthorized: !insecure }),
  // Proxmox sometimes benefits from explicit timeouts
  timeout: 30_000,
});

interface ResponseData {
  data: { data: unknown };
}

/** Proxmox wraps payloads as { data: ... }. This unwrap handles a few shapes. */
export function unwrap<T = ResponseData>(x: ResponseData): T {
  if (!x) return x as T;
  // axios response
  if (x.data?.data !== undefined) return x.data.data as T;
  // already passed res.data
  if (x.data !== undefined) return x.data as T;
  // raw object
  if (x.data === undefined && x !== undefined) return x as T;
  return x as T;
}
