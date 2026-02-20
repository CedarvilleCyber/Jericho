import requests

# Note: the below IPs are the raspberry Pis' Ludus-accessible IPs. 
nuclear_url = 'http://192.0.2.101:8000/smoke'
nuclear_payload = { "duration": 8 }

sound_url = 'http://192.0.2.104:8000/play'
sound_payload = { "sound": "nuclear8.wav" }

# TODO: update this so that the POST requests are simultaneous.
# Maybe use asynchronous requests or threading?

# make the POST requests, using JSON mode
nuclear_response = requests.post(nuclear_url, json=nuclear_payload)
sound_response = requests.post(sound_url, json=sound_payload)

print(f"Nuclear status code: {nuclear_response.status_code}")
print(f"Nuclear response body: {nuclear_response.json()}")

print(f"Sound status code: {sound_response.status_code}")
print(f"Sound response body: {sound_response.json()}")