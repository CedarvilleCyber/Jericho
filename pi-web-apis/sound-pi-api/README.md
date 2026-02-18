# Sound Playback API (Simplified)

A minimal Flask API for playing sounds on a Raspberry Pi.

## Setup

```bash
uv sync           # install dependencies
uv run main.py    # start the server for testing
uv run gunicorn -b 0.0.0.0:8000 main:app  # run server for prod
```

---

## Endpoints

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

### `GET /health`

Health check. Returns 200 OK if you can hit the endpoint. 

---

## Adding Sound Playback

Edit the `play_sound()` function in `app.py` to add your actual playback code:

```python
def play_sound(sound: str, duration: float | None = None) -> None:
    if duration:
        # TODO: Play sound looping for 'duration' seconds
        pass
    else:
        # TODO: Play sound once
        pass
```

---

## Examples

```bash
# Play once
curl http://localhost:8000/play \
     -H "Content-Type: application/json" \
     -d '{"sound": "beep.wav"}'

# Loop for 10 seconds
curl http://localhost:8000/play \
     -H "Content-Type: application/json" \
     -d '{"sound": "funky.wav", "duration": 10}'

# List available sounds
curl http://localhost:8000/sounds
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
