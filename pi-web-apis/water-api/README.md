# Water Clarifier API

A lightweight Go API for controlling the water treatment clarifier arms on a Raspberry Pi.


---

## Features
The API has various endpoints to check health and state, the API also provides individual
control over each of the arms.
The specifics can be found below along with examples of API calls

## Build Process
**Note**: The latest executable can be found in the water-api directory

The executable can be cross complied for a raspberry pi running `armv71` using the
following go build command.

```bash
env GOOS=linux GOARCH=arm GOARM=7 go build -o water-api main.go
```

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

### `POST /trigger`
Triggers a preset effect for the arms, provides an easy way to display 
the water treatment physical effect  

**Response:**
```json
{ "status": "triggered" }
```

### `POST /start`

Starts idle spinning on both arms.

**Response:**
```json
{"message": "idle started for both arms"}
```

### `POST /stop`

Stops idle spinning on both arms and clears the GPIO outputs.

**Response:**
```json
{"message": "idle stopped for both arms"}
```

### `POST /arm1/start`

Starts idle spinning for arm 1 only.

**Response:**
```json
{"message": "idle started for arm1"}
```

### `POST /arm1/stop`

Stops idle spinning for arm 1 only.

**Response:**
```json
{"message": "idle stopped for arm1"}
```

### `POST /arm2/start`

Starts idle spinning for arm 2 only.

**Response:**
```json
{"message": "idle started for arm2"}
```

### `POST /arm2/stop`

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

## Examples

```bash
# Check health
curl http://water.jericho.local:8000/health

# Get current state
curl http://water.jericho.local:8000/state

# Start both arms
curl -X POST http://water.jericho.local:8000/start

# Stop both arms
curl -X POST http://water.jericho.local:8000/stop

# Stop arm1 only
curl -X POST http://water.jericho.local:8000/arm1/stop

# Start arm2 only
curl -X POST http://water.jericho.local:8000/arm2/start
```
