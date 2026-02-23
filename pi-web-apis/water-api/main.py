from flask import Flask, request, jsonify # type: ignore (remove before deployment)
from time import sleep

app = Flask(__name__)

VALID_DIRECTIONS = {"clockwise", "counterclockwise"}

# Helper Functions ------------------------------------------------------------

def set_motor(arm_id: str, direction: str, speed: int) -> None:
    # This function drives a single motor.
    # You need to figure out how Kaicheng set things up on the Pi, then add some
    # code here to make the motor spin the way you want it to. 
    
    print("TODO: write set_motor function")

def validate_arm(arm_id: str, config: dict) -> str | None:

    if "direction" not in config or "speed" not in config: 
        return f"{arm_id}: 'direction' and 'speed' are both required."

    direction = config["direction"]
    speed = config["speed"]

    if direction not in VALID_DIRECTIONS:
        return f"{arm_id}: 'direction' must be 'clockwise' or 'counterclockwise', got '{direction}'"

    if not isinstance(speed, int) or speed < 0 or speed > 20:
        return f"{arm_id}: 'speed' must be a non-negative integer, got {speed!r}"

    return None

# Routes ----------------------------------------------------------------------

# This route does not work yet. 
#@app.route("/motors", methods=["POST"])
def control_motors():
    # This route expects a POST request with the following JSON format: 
    # {
    #     "arm1": { "direction": "clockwise", "speed": 5 },
    #     "arm2": { "direction": "counterclockwise", "speed": 3 }
    # }

    body = request.get_json(silent=True)

    if not body or not isinstance(body, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if len(body) == 0:
        return jsonify({"error": "No arms specified"}), 400

    # Validate all arms before touching any motor (fail fast)
    errors = {}
    for arm_id, config in body.items():
        err = validate_arm(arm_id, config)
        if err:
            errors[arm_id] = err

    if errors:
        return jsonify({"errors": errors}), 400

    # Apply settings
    results = {}
    for arm_id, config in body.items():
        set_motor(arm_id, config["direction"], config["speed"])
        results[arm_id] = {
            "status": "stopped" if config["speed"] == 0 else "updated"
        }

    return jsonify({"ok": True, "motors": results}), 200

# Note: this route relies on the presence of a deprecated and undocumented script
# on the Raspberry Pi. If you're not working with the original Cedarville Jericho
# project, we highly recommend fixing the above routes instead of trying to use this one.
@app.route("/stop")
def stop():
    with open("/home/pi/Documents/env/trigger.txt", "w") as file:
        file.write("0")
    return jsonify({"status": "ok"}), 200

@app.route("/health")
def ping(): 
    return jsonify({"status": "ok"}), 200

# Initialize Program ----------------------------------------------------------
print("water API initialized")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
