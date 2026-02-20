import requests
from threading import Thread

# Note: the below IPs are the raspberry Pis' Ludus-accessible IPs. 
nuclear_url = 'http://192.0.2.101:8000/smoke'
nuclear_payload = { "duration": 8 }

sound_url = 'http://192.0.2.104:8000/play'
sound_payload = { "sound": "nuclear8.wav" }

# TODO: update this so that the POST requests are simultaneous.
# Maybe use asynchronous requests or threading?

def play_nuclear():
    nuclear_response = requests.post(nuclear_url, json=nuclear_payload)
    print(f"Nuclear status code: {nuclear_response.status_code}")
    print(f"Nuclear response body: {nuclear_response.json()}")

def play_sound():
    sound_response = requests.post(sound_url, json=sound_payload)
    print(f"Sound status code: {sound_response.status_code}")
    print(f"Sound response body: {sound_response.json()}")

nuclear_fog = Thread(target=play_nuclear)
nuclear_sound = Thread(target=play_sound)
nuclear_fog.start()
nuclear_sound.start()
nuclear_fog.join()
nuclear_sound.join()

# make the POST requests, using JSON mode

