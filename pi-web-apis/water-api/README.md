# Water Clarifier API

A lightweight Go API for controlling the water treatment clarifier arms on a Raspberry Pi.

## Setup

```bash
env GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0 go build -o water-api main_ai.go # Build command on local machine

./water-api 
```

The API is exposed at `http://water.jericho.local:8000`.

---

## Endpoints

### `GET /health`

Returns service health.

**Response:**
```json
{"status": "ok"}
```

### `GET /state`

Returns the current arm idle state and step positions.

**Response:**
```json
{
  "arm1_active": true,
  "arm2_active": true,
  "current_step_1": 3,
  "current_step_2": 5
}
```

### `GET /idle/start`

Starts idle spinning on both arms.

**Response:**
```json
{"message": "idle started for both arms"}
```

### `GET /idle/stop`

Stops idle spinning on both arms and clears the GPIO outputs.

**Response:**
```json
{"message": "idle stopped for both arms"}
```

### `GET /idle/arm1/start`

Starts idle spinning for arm 1 only.

**Response:**
```json
{"message": "idle started for arm1"}
```

### `GET /idle/arm1/stop`

Stops idle spinning for arm 1 only.

**Response:**
```json
{"message": "idle stopped for arm1"}
```

### `GET /idle/arm2/start`

Starts idle spinning for arm 2 only.

**Response:**
```json
{"message": "idle started for arm2"}
```

### `GET /idle/arm2/stop`

Stops idle spinning for arm 2 only.

**Response:**
```json
{"message": "idle stopped for arm2"}
```

---

## Notes

- The Go API controls two stepper-style arms and a water tower LED on a Raspberry Pi.
- Both arms start in the active idle state by default.
- No request body is required for the current routes; all controls are done via GET requests.

---

## Quick curl examples

```bash
# Check health
curl http://water.jericho.local:8000/health

# Get current state
curl http://water.jericho.local:8000/state

# Start both arms
curl http://water.jericho.local:8000/idle/start

# Stop both arms
curl http://water.jericho.local:8000/idle/stop

# Stop arm1 only
curl http://water.jericho.local:8000/idle/arm1/stop

# Start arm2 only
curl http://water.jericho.local:8000/idle/arm2/start
```
