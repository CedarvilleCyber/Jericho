# Traffic Light API

A Raspberry Pi-based REST API for controlling traffic light hardware using direct GPIO pin control.

## Features
The API has various endpoints to check health and state, the API can shift between normal traffic cycle
to stop light cycle and a full blackout. There are also calls to test each light color.
The specifics can be found below along with examples of API calls

## Build Process
**Note**: The latest executable can be found in the traffic-api directory

The executable can be cross complied for a raspberry pi running `armv71` using the
following go build command.

```bash
env GOOS=linux GOARCH=arm GOARM=7 go build -o traffic-api main.go
```

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

## API Endpoints

### `GET /health`
Health check. Returns 200 OK if the API is responsive

```bash
curl http://localhost:8000/health
```
**Response**
```json
{"status": "ok"}
```

### `GET /state`
Returns the complete state of all lights and the traffic cycle
```bash
curl http://localhost:8000/state
```
**Response**
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

### `POST /start`
Runs normal traffic light cycle

```bash
curl -X POST http://localhost:8000/start
```
**Response**
```json
{"message":  "idle started"}
```


### `POST /stop`
Enters flash mode - all lights off, then red
```bash
curl -X POST http://localhost:8000/stop
```
**Response**
```json
{"message":  "idle stopped"}
```

### `POST /blackout`
Stops all automatic functions, enables manual control
```bash
curl -X POST http://localhost:8000/blackout
```
Starts with all lights off. Use individual light control endpoints to manually set desired lights.

**Response**
```json
{"status": "blackout","message":  "manual control enabled"}
```

### `POST /blackout/exit`
Returns to idle cycle
```bash
curl -X POST http://localhost:8000/blackout/exit
```
**Response**
```json
{"status": "blackout exited","message":  "return to idle mode"}
```

### Individual Light Control

**Set Individual Light State** (Primary Control Method) 

### `POST /light`

Controls a specific traffic light. This overrides any automatic cycling and gives you direct control over each light.

**Data Options** \
Directions: `north-south` or `ns`, `east-west` or `ew` \
Colors: `red`, `yellow`, `green` \
States: `on` (default), `off`

```bash
# Turn on north-south red light
curl "http://localhost:8000/light" \
      -H "Content-Type: application/json" \
      -d '{"direction": "north-south", "color": "red", "state": "on"}' 

# Turn off east-west green light
curl "http://localhost:8000/light" \
      -H "Content-Type: application/json" \
      -d '{"direction": "ew", "color": "green", "state": "off"}'

# Turn on east-west yellow (state=on is default)
curl "http://localhost:8000/light" \
      -H "Content-Type: application/json" \
      -d '{"direction": "east-west", "color": "yellow"}'
```

**Response Example**
```json
{
  "direction": "north-south",
  "color": "red",
  "state": "on"
}
```

### `GET /light/:direction/:color`
```bash
curl http://localhost:8000/light/north-south/red
```
**URL Options** \
Directions: `north-south` or `ns`, `east-west` or `ew` \
Colors: `red`, `yellow`, `green`

**Response Example**
```json
{
  "direction": "north-south",
  "color": "red",
  "on": true
}
```

### Test Modes

Activate test modes where all lights display a single color:

### `POST /test/:mode`

Modes: `red`, `yellow`, `green`

```bash
# Make all lights red
curl -X POST http://localhost:8000/test/red

# Make all lights yellow
curl -X POST http://localhost:8000/test/yellow

# Make all lights green
curl -X POST http://localhost:8000/test/green
```

**Response Example**
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