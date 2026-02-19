# Nuclear Smoke API
A minimal Flask API for controlling nuclear smoke effects on a Raspberry Pi via GPIO.
## Setup

```bash
uv sync           # install dependencies
uv run main.py    # start the server for testing OR use gunicorn (below)
uv run gunicorn -b 0.0.0.0:8000 main:app  # run server for prod
```

---
## Endpoints
### `POST /smoke`
Trigger the nuclear smoke effect for a specified duration.

**Request:**
```json
{ "duration": 5 }
```

| Field      | Required | Type   | Description                                |
|------------|----------|--------|--------------------------------------------|
| duration   | Yes      | number | Seconds (must be between 0 and 15)         |

**Response (200):**
```json
{
    "ok": true,
    "duration": 5
}
```

**Error (400):**
```json
{ "error": "'duration' field is required" }
```

**Error (200 - System Busy):**
```json
{ "system busy": "Another request is being processed. Wait 5-10 seconds, then retry." }
```
### `GET /health`
Health check. Returns 200 OK if the API is responsive.

**Response:**
```json
{ "status": "ok" }
```

---

## Examples
```bash
# Trigger smoke for 3 seconds
curl http://localhost:8000/smoke \
     -H "Content-Type: application/json" \
     -d '{"duration": 3}'

# Trigger smoke for 10 seconds
curl http://localhost:8000/smoke \
     -H "Content-Type: application/json" \
     -d '{"duration": 10}'

# Health check
curl http://localhost:8000/health
```

---
## Configuration
- **GPIO Pin:** Pin 21 (configurable in `trigger_smoke()`)
- **Max Duration:** 15 seconds (prevents system overload)
- **Request Throttling:** Prevents simultaneous triggers with built-in cooldown
