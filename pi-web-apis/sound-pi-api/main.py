from flask import Flask, request, jsonify # type: ignore (remove this later)
import os
import subprocess

app = Flask(__name__)

SOUND_DIR = "/opt/sounds"

# Populated dynamically by populate_available_sounds()
AVAILABLE_SOUNDS: list[str] = []

def play_sound(sound: str, duration: float | None = None) -> None:
    filepath = os.path.join(SOUND_DIR, sound)
    subprocess.run(["aplay", filepath])
    # fill in later - add duration-based looping

def validate_request(body: dict | None) -> tuple[dict, int] | None:
    """
    Validate the play request body.
    Returns None if valid, or (error_dict, status_code) if invalid.
    """
    if not body or not isinstance(body, dict):
        return {"error": "Request body must be a JSON object"}, 400
    
    # Validate sound field
    if "sound" not in body:
        return {"error": "'sound' field is required"}, 400
    
    sound = body["sound"]
    
    if not isinstance(sound, str):
        return {"error": "'sound' must be a string"}, 400
    
    if not sound.endswith(".wav"):
        return {"error": "'sound' must be a .wav file"}, 400
    
    if sound not in AVAILABLE_SOUNDS:
        return {
            "error": f"Sound '{sound}' not available",
            "available_sounds": AVAILABLE_SOUNDS
        }, 400
    
    # Validate duration if provided
    duration = body.get("duration")
    if duration is not None:
        if not isinstance(duration, (int, float)):
            return {"error": "'duration' must be a number"}, 400
        if duration <= 0:
            return {"error": "'duration' must be positive"}, 400
    
    return None

def populate_available_sounds() -> None:
    # Scan /opt/sounds directory and populate AVAILABLE_SOUNDS list with .wav files.
    global AVAILABLE_SOUNDS
    
    if not os.path.exists(SOUND_DIR):
        return
    
    AVAILABLE_SOUNDS.clear()
    
    for filename in os.listdir(SOUND_DIR):
        if filename.endswith('.wav'):
            AVAILABLE_SOUNDS.append(filename)
    
    AVAILABLE_SOUNDS.sort()

# -----------------------------------------------------------------------------

@app.route("/play", methods=["POST"])
def play():
    body = request.get_json(silent=True)
    
    # Validate request
    error_result = validate_request(body)
    if error_result is not None:
        error_dict, status_code = error_result
        return jsonify(error_dict), status_code
    
    sound = body["sound"]
    duration = body.get("duration")
    
    play_sound(sound, duration)
    
    return jsonify({
        "ok": True,
        "sound": sound,
        "duration": duration if duration else "once"
    }), 200

@app.route("/sounds", methods=["GET"])
def list_sounds():
    # GET /sounds
    # Returns list of available sounds.
    return jsonify({
        "ok": True,
        "sounds": AVAILABLE_SOUNDS,
        "count": len(AVAILABLE_SOUNDS)
    }), 200

@app.route("/health")
def ping():
    return jsonify({"status": "ok"}), 200

# -----------------------------------------------------------------------------

if __name__ == "__main__":
    populate_available_sounds()
    app.run(host="0.0.0.0", port=8000, debug=False)
