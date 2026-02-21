# Motor Control API

A lightweight Flask API for controlling motors on a Raspberry Pi Zero.

## Setup

```bash
uv sync            # install dependencies
uv run main.py     # start the server
```

The API will be available at `http://<pi-ip>:5000`.

---

## Endpoints

### `POST /motors`

NOTE: this endpoint is currently incomplete and does not work. 

Control one or more arms in a single request.

**Request body:**
```json
{
    "arm1": { "direction": "clockwise",         "speed": 5 },
    "arm2": { "direction": "counterclockwise",  "speed": 3 }
}
```

| Field       | Type             | Rules                                         |
|-------------|------------------|-----------------------------------------------|
| `direction` | string           | `"clockwise"` or `"counterclockwise"`         |
| `speed`     | non-negative int | RPM; set to `0` to stop                       |

**Success response (200):**
```json
{
    "ok": true,
    "motors": {
        "arm1": { "direction": "clockwise", "speed": 5, "status": "running" },
        "arm2": { "direction": "counterclockwise", "speed": 3, "status": "running" }
    }
}
```

**Validation error (400):**
```json
{
    "errors": {
        "arm1": "arm1: 'direction' must be 'clockwise' or 'counterclockwise', got 'spin'"
    }
}
```

**Stop an arm** — set `speed` to `0`:
```json
{ "arm1": { "direction": "clockwise", "speed": 0 } }
```

### `GET /health`

Returns `{"status": "ok"}` — useful for checking the Pi is reachable.

### `GET /stop`

Stops the water treatment spinners for five seconds. 

---

## Hooking up real motors

In `main.py`, find `set_motor()` and replace the `TODO` comments with your
actual GPIO / PWM / motor-controller calls. Common choices on Pi Zero:

- **L298N / L293D** — set direction pin high/low, PWM pin for speed
- **DRV8833 / TB6612** — similar, two direction pins + PWM
- **Stepper via A4988** — send step pulses and set DIR pin

---

## Quick curl examples

```bash
# Start two arms (not working yet)
curl http://<pi-ip>:8000/motors \
     -H "Content-Type: application/json" \
     -d '{"arm1":{"direction":"clockwise","speed":5},"arm2":{"direction":"counterclockwise","speed":3}}'

# Stop arm1 (not working yet)
curl http://<pi-ip>:8000/motors \
     -H "Content-Type: application/json" \
     -d '{"arm1":{"direction":"clockwise","speed":0}}'

# Stop the arms for ten seconds using the simple STOP route
curl http://<pi-ip>:8000/stop

# Health check
curl http://<pi-ip>:8000/health
```
