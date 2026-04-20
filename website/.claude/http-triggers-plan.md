# Plan: Replace SSH Triggers with HTTP Requests

## Status: Blocked — waiting on upstream merges

Before implementing, two Pi APIs need to be merged into `pi-web-apis`:
- **sound-api** (needed by nuclear and water triggers)
- **traffic-api** (needed by traffic trigger)

---

## Network

Web server reaches Pis via Wireguard at `192.168.42.x`:

| Scenario     | IP               | Notes                        |
|--------------|------------------|------------------------------|
| Nuclear      | 192.168.42.11    |                              |
| Traffic      | 192.168.42.12    |                              |
| Water        | 192.168.42.13    |                              |
| Sound        | 192.168.42.14    |                              |
| Datacenter   | 192.168.42.15    | Matrix API — IP unconfirmed  |

All APIs run on port **8000**.

---

## Endpoint Mapping

### `triggerNuclear()`
- `POST http://192.168.42.11:8000/smoke` — `{ "duration": 10 }`
- `POST http://192.168.42.14:8000/play` — `{ "sound": "nuclear5.wav" }` (parallel)

### `triggerTraffic()`
- `POST http://192.168.42.12:8000/lights` — payload TBD once traffic-api is implemented

### `triggerWaterTreatment()`
- `GET http://192.168.42.13:8000/stop`
- `POST http://192.168.42.14:8000/play` — `{ "sound": "water5.wav" }` (parallel)

### `triggerDatacenter()`
- `POST http://192.168.42.15:8000/flash?text=HACK&color=R` (or `/idle/start`) — TBD once matrix IP confirmed

---

## Implementation Steps

1. **After sound-api and traffic-api are merged upstream**, confirm final route shapes.
2. **Confirm matrix API IP** (192.168.42.15 unverified) and which endpoint to use for datacenter trigger.
3. **Rewrite `lib/scenarios/demo.ts`**:
   - Remove all SSH logic and `NodeSSH` imports
   - Replace each trigger with `fetch` calls using the endpoint map above
   - Fire sound + effect in parallel where applicable (both return immediately — effects run in background on Pi)
   - Keep the same return type: `{ success: boolean; error?: string }`
4. **Remove `node-ssh`** from `package.json` / `bun.lock` once SSH is gone.
5. **Remove `SSH_PRIVATE_KEY`** from env — no longer needed.
6. **Update `.env.example`** if one exists — add any new env vars (IPs, if we decide to make them configurable).

---

## Open Questions

- Traffic API `/lights` payload: not yet defined in the upstream stub — confirm schema once merged.
- Datacenter trigger: `/flash` (one-shot message) vs `/idle/start` (continuous scroll)? And confirm IP.
- Should Pi IPs be hardcoded (like the payload scripts do) or moved to env vars for flexibility?
