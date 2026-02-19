import requests

# Note: the below IPs are the raspberry Pis' Ludus-accessible IPs. 
nuclear_url = 'http://192.0.2.101:8000/smoke'
nuclear_payload = { "duration": 8 }

sound_url = 'http://192.0.2.104:8000/play'
sound_payload = {"sound": "nuclear8.wav"}

# make the POST requests, using JSON mode
nuclear_response = requests.post(nuclear_url, json=nuclear_payload)

print(f"Status code: {nuclear_response.status_code}")
print(f"Response body: {nuclear_response.json()}")