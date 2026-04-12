# Traffic Light API

A Raspberry Pi-based REST API for controlling traffic light hardware using direct GPIO pin control.

## Hardware Configuration

The API controls LEDs connected to the following GPIO pins:

### North-South Direction
- **GPIO 5** (P1_29): Red Light
- **GPIO 6** (P1_31): Yellow Light  
- **GPIO 13** (P1_33): Green Light

### East-West Direction
- **GPIO 16** (P1_36): Red Light
- **GPIO 20** (P1_38): Yellow Light
- **GPIO 21** (P1_40): Green Light

**Note:** The LEDs have common anode, so GPIO logic is inverted (High = Off, Low = On)

## Building and Running

### Prerequisites
- Go 1.21+
- Raspberry Pi with periph.io support
- Required Go packages: gin-gonic/gin, periph.io

### Build
```bash
cd golang
go mod download
env GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0 go build -o traffic-api main.go
```

### Run
```bash
./traffic-api
```

## API Endpoints

### Health Check
**GET** `/health`
```bash
curl http://localhost:8000/health
```
Response:
```json
{"status": "ok"}
```

### Get Current State
**GET** `/state`
Returns the complete state of all lights and the traffic cycle
```bash
curl http://localhost:8000/state
```
Response:
```json
{
  "north_south": {
    "red": true,
    "yellow": false,
    "green": false
  },
  "east_west": {
    "red": false,
    "yellow": false,
    "green": true
  },
  "idle_active": true,
  "blackout": false,
  "step": 0
}
```

### Idle Control

**Start Idle Mode** (runs normal traffic light cycle)
**POST** `/idle/start`
```bash
curl -X POST http://localhost:8000/idle/start
```

**Stop Idle Mode** (enters flash mode - all lights off, then red)
**POST** `/idle/stop`
```bash
curl -X POST http://localhost:8000/idle/stop
```

### Blackout Mode

**Enter Blackout Mode** (stops all automatic functions, enables manual control)
**POST** `/blackout`
```bash
curl -X POST http://localhost:8000/blackout
```
Starts with all lights off. Use individual light control endpoints to manually set desired lights.

**Exit Blackout Mode** (returns to idle cycling)
**POST** `/blackout/exit`
```bash
curl -X POST http://localhost:8000/blackout/exit
```

### Individual Light Control

**Set Individual Light State** (Primary Control Method)
**POST** `/light/:direction/:color?state=on|off`

Controls a specific traffic light. This overrides any automatic cycling and gives you direct control over each light.

Directions: `north-south` or `ns`, `east-west` or `ew`
Colors: `red`, `yellow`, `green`
States: `on` (default), `off`

```bash
# Turn on north-south red light
curl -X POST "http://localhost:8000/light/north-south/red?state=on"

# Turn off east-west green light
curl -X POST "http://localhost:8000/light/ew/green?state=off"

# Turn on east-west yellow (state=on is default)
curl -X POST "http://localhost:8000/light/east-west/yellow"
```

Response:
```json
{
  "direction": "north-south",
  "color": "red",
  "state": "on"
}
```

**Get Individual Light State** (for debugging/verification)
**GET** `/light/:direction/:color`
```bash
curl http://localhost:8000/light/north-south/red
```

Response:
```json
{
  "direction": "north-south",
  "color": "red",
  "on": true
}
```

### Test Modes

Activate test modes where all lights display a single color:

**POST** `/test/:mode`

Modes: `red`, `yellow`, `green`

```bash
# Make all lights red
curl -X POST http://localhost:8000/test/red

# Make all lights yellow
curl -X POST http://localhost:8000/test/yellow

# Make all lights green
curl -X POST http://localhost:8000/test/green
```

Response:
```json
{
  "mode": "red",
  "status": "activated"
}
```

## Traffic Light Cycle

When idle mode is active, the lights cycle through:

1. **Step 0 (5 seconds):** North-South RED, East-West GREEN
2. **Step 1 (1 second):** East-West YELLOW
3. **Step 2 (5 seconds):** North-South GREEN, East-West RED
4. **Step 3 (1 second):** North-South YELLOW
5. *Repeats...*

## Flash Mode

When idle is stopped, the lights enter flash mode:
- Alternates between all red lights ON and all lights OFF
- 1 second interval
- Used as a safety failsafe when the normal cycle is disabled