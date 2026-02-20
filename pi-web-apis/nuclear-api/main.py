from flask import Flask, request, jsonify # type: ignore (remove before deployment)
import time
from gpiozero import LED # type: ignore (remove this before deployment)

app = Flask(__name__)

time_of_last_request = 0
previous_duration = 0

# Helper Functions ------------------------------------------------------------

def validate_request(body: dict | None) -> tuple[dict, int] | None:
    # Validate the request body.
    # Returns None if valid, or (error_dict, status_code) if invalid.

    global time_of_last_request
    global previous_duration

    if not body or not isinstance(body, dict):
        return {"error": "Request body must be a JSON object"}, 400
    
    # Validate duration field
    if "duration" not in body:
        return {"error": "'duration' field is required"}, 400
    
    duration = body["duration"]

    if not isinstance(duration, (int, float)):
        return {"error": "'duration' must be a number"}, 400
    if duration <= 0:
        return {"error": "'duration' must be between 0 and 15 seconds"}, 400
    
        # This prevents multiple students from triggering the smoke simultaneously.
    if time.time() < time_of_last_request + previous_duration + 3:
        return {"system busy": "Another request is being processed. Wait 5-10 seconds, then retry."}, 200
    else:
        time_of_last_request = time.time()
        previous_duration = duration

    return None

def trigger_smoke(duration: int | float) -> dict[str,str] | None:
    # Note - we're using Python's gpiozero library to control the nuclear smoke.
    # The LED function is used to issue simple on/off commands to the nuclear pin.
    # We used to use pin 21, but then it stopped working, so we switched to pin 16

    pin = LED(21)    

    try: 
        pin.on()
        time.sleep(duration)
        print(f"Duration: {duration}")
        pin.off()
    except Exception as e: 
        pin.off()
        error_response = {
            "error": "Trigger Failure",
            "message": str(e)
        }
        return error_response

# Routes ----------------------------------------------------------------------

@app.route("/smoke", methods=["POST"])
def smoke():
    body = request.get_json(silent=True)

    # Validate request
    error_result = validate_request(body)
    if error_result is not None:
        error_dict, status_code = error_result
        return jsonify(error_dict), status_code

    duration = body["duration"]
    trigger_error = trigger_smoke(duration)

    if trigger_error is not None: 
        return jsonify(trigger_error), 500

    # TODO: update this so the user gets the request immediately? They currently 
    # don't get a response until the smoke is done.
    return jsonify({
        "ok": True,
        "duration": duration
    }), 200

@app.route("/health")
def ping(): 
    return jsonify({"status": "ok"}), 200

# Initialize Program ----------------------------------------------------------

print("nuclear API initialized")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)