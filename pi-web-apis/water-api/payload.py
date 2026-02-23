import requests
import sys
# Note: the below IPs are the raspberry Pis' Ludus-accessible IPs. 
sound_url = 'http://192.0.2.104:8000/play'
sound_payload = { "sound": "water5.wav" }

water_url = 'http://192.0.2.103:8000/stop'

# Note: in an unthreaded payload, you must call the sound API first, since the
# sound API itself uses threads to instantaneously send a response to the client.

sound_response = requests.post(sound_url, json=sound_payload)

if sound_response.status_code == 429:
    print("Error: system in use. Wait a few seconds and try again.")
    sys.exit()

water_response = requests.get(water_url)

print(f"Sound status code: {sound_response.status_code}")
print(f"Sound response body: {sound_response.json()}")
print(f"Water status code: {water_response.status_code}")
