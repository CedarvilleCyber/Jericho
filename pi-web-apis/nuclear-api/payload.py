import requests
from threading import Thread
import sys

# Note: the below IPs are the raspberry Pis' Ludus-accessible IPs. 
nuclear_url = 'http://192.0.2.101:8000/smoke'
nuclear_payload = { "duration": 5 }

sound_url = 'http://192.0.2.104:8000/play'
sound_payload = { "sound": "nuclear5.wav" }


sound_response = requests.post(sound_url, json=sound_payload)

if sound_response.status_code == 429:
    print("Error: system in use. Wait a few seconds and try again.")
    sys.exit()

nuclear_response = requests.post(nuclear_url, json=nuclear_payload)

print(f"Sound status code: {sound_response.status_code}")
print(f"Sound response body: {sound_response.json()}")
print(f"Nuclear status code: {nuclear_response.status_code}")
print(f"Nuclear response body: {nuclear_response.json()}")