# Sound Playback API (Simplified)

A minimal Flask API for playing sounds on a Raspberry Pi.

## Features
The API has various endpoints to check health and available sounds of the API, 
along with a play call to play those sounds.
The specifics can be found below along with examples of API calls

## Build Process
**Note**: The latest executable can be found in the sound-api directory

The executable can be cross complied for a raspberry pi running `armv71` using the
following go build command.

```bash
env GOOS=linux GOARCH=arm GOARM=7 go build -o sound-api main.go
```

## Endpoints

### `GET /health`

Health check. Returns 200 OK if you can hit the endpoint.


### `GET /sounds`

List available sounds.

**Response:**
```json
{
    "ok": true,
    "sounds": ["beep.wav", "funky.wav", "alarm.wav", "notification.wav"],
    "count": 4
}
```

### `POST /play`

Play a sound from the hardcoded list.

**Request:**
```json
{
    "sound": "funky.wav",
    "duration": 5
}
```

| Field      | Required | Type   | Description                                |
|------------|----------|--------|--------------------------------------------|
| sound      | Yes      | string | `Must be a .wav file in AVAILABLE_SOUNDS`  |
| duration   | No       | number | Seconds (will loop if sound is shorter)    |

**Response (200):**
```json
{
    "ok": true,
    "sound": "funky.wav",
    "duration": 5
}
```

**Error (400):**
```json
{
    "error": "Sound 'missing.wav' not available",
    "available_sounds": ["beep.wav", "funky.wav", "alarm.wav", "notification.wav"]
}
```
---

## Examples

```bash
# Health check
curl http://localhost:8000/health

# List available sounds
curl http://localhost:8000/sounds

# Play once
curl http://localhost:8000/play \
     -H "Content-Type: application/json" \
     -d '{"sound": "nuclear5.wav"}'

# Loop for 10 seconds (note: currently unimplemented)
curl http://localhost:8000/play \
     -H "Content-Type: application/json" \
     -d '{"sound": "steal.wav", "duration": 10}'

```

---

## Adding New Sounds

Edit `AVAILABLE_SOUNDS` in `app.py`:

```python
AVAILABLE_SOUNDS = [
    "beep.wav",
    "funky.wav",
    "alarm.wav",
    "notification.wav",
    "your-new-sound.wav",  # Add here
]
```
