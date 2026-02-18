from flask import Flask, request, jsonify
import os

app = Flask(__name__)

SOUND_DIR = "/opt/sounds"

# Hardcoded list of available sounds
AVAILABLE_SOUNDS = [
    "capture.wav",
    "steal.wav",
    "beep.wav",
    "funky.wav",
    "alarm.wav",
    "notification.wav",
]

def play_sound(sound: str, duration: float | None = None) -> None:
    filepath = os.path.join(SOUND_DIR, sound)
    subprocess.run(["aplay", filepath])
    # fill in later - add duration-based looping

def validate_request() -> str | None:
    # fill in later
    return None;

# -----------------------------------------------------------------------------

@app.route("/play", methods=["POST"])
def play():

    body = request.get_json(silent=True)

    if not body or not isinstance(body, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400

    # Validate sound field
    if "sound" not in body:
        return jsonify({"error": "'sound' field is required"}), 400

    sound = body["sound"]

    if not isinstance(sound, str):
        return jsonify({"error": "'sound' must be a string"}), 400

    if not sound.endswith(".wav"):
        return jsonify({"error": "'sound' must be a .wav file"}), 400

    if sound not in AVAILABLE_SOUNDS:
        return jsonify({
            "error": f"Sound '{sound}' not available",
            "available_sounds": AVAILABLE_SOUNDS
        }), 400

    # Validate duration if provided
    duration = body.get("duration")
    if duration is not None:
        if not isinstance(duration, (int, float)):
            return jsonify({"error": "'duration' must be a number"}), 400
        if duration <= 0:
            return jsonify({"error": "'duration' must be positive"}), 400

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
    app.run(host="0.0.0.0", port=8000, debug=False)
