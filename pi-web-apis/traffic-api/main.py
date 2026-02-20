# This program makes use of IDs to differentiate between students. I haven't 
# decided what these IDs will be yet. The IDs must persist even when students
# pivot deeper into the network and route their traffic through other machines.
# For simple scenarios where students are only attacking one machine, you can
# use the IP address of the student's Kali VM as the ID, since they'll be sending
# traffic directly from their Kali to the target server, which can then send
# the Kali's IP address to the Raspberry Pi within the JSON body. 

from flask import Flask, request, jsonify # type: ignore (remove before deployment)
import time
import threading

app = Flask(__name__)

time_of_last_request = time.time()
previous_id = "a.b.c.d" # Use IPs for this in simple scenarios

# Threading event to coordinate between normal_light_operation and request handlers.
# David's note: do we need this? Test and see
# request_in_progress = threading.Event()

# Helper Functions ------------------------------------------------------------

def validate_request(request) -> tuple[dict, int] | None:
    # Validate the request body.
    # Returns None if valid, or (error_dict, status_code) if invalid.

    body = request.get_json(silent=True)
    current_id = request.remote_addr

    global time_of_last_request
    global previous_id

    if not body or not isinstance(body, dict):
        return {"error": "Request body must be a JSON object"}, 400
    
    # TODO: add validation for the traffic light specific fields. 
    
    # This prevents multiple students from controlling the lights simultaneously.
    if time.time() <= time_of_last_request + 3 and current_id != previous_id:
        return {"system busy": "Another request is being processed. Wait a few seconds, then retry."}, 200
    else:
        time_of_last_request = time.time()
        previous_id = current_id

    return None

def change_lights() -> None:
    print("TODO: fill this in")

def normal_light_operation() -> None:

    while True:

        # Wait until 5 seconds have passed since the last request
        while time.time() - time_of_last_request < 5:
            time.sleep(0.25)
        
        # make N/S lights green (E/W lights remain red)
        time.sleep(2)
        
        # make N/S lights yellow (E/W lights remain red)
        time.sleep(2)
        
        # make N/S lights red (E/W lights remain red)
        time.sleep(0.5)

        # make E/W lights green
        time.sleep(2)
        
        # Make E/W lights yellow
        time.sleep(2)

        # make E/W lights red
        time.sleep(0.5)

# Routes ----------------------------------------------------------------------

@app.route("/lights", methods=["POST"])
def lights():
    # Signal that a request is being processed
    # request_in_progress.set()
    
    try:
        body = request.get_json(silent=True)

        # Validate request
        error_result = validate_request(body)
        if error_result is not None:
            error_dict, status_code = error_result
            return jsonify(error_dict), status_code

        # param1 = body["param1"]
        # change_lights(param1)

        return jsonify({
            "ok": True,
            "param1": "placeholder"
        }), 200
    
    finally:
        # request_in_progress.clear()
        print("")

@app.route("/health")
def ping(): 
    return jsonify({"status": "ok"}), 200

# Initialize Program ----------------------------------------------------------

print("traffic light API initialized")

normal_traffic_thread = threading.Thread(target=normal_light_operation, daemon=True, name="Norm")
normal_traffic_thread.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
