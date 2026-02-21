import requests
from threading import Thread

# Note: the below IPs are the raspberry Pis' Ludus-accessible IPs. 
water_url = 'http://192.0.2.101:8000/stop'

sound_url = 'http://192.0.2.104:8000/play'
sound_payload = { "sound": "water5.wav" }

def trigger_water():
    water_response = requests.post(water_url)
    print(f"Water status code: {water_response.status_code}")
    print(f"Water response body: {water_response.json()}")

def play_sound():
    sound_response = requests.post(sound_url, json=sound_payload)
    print(f"Sound status code: {sound_response.status_code}")
    print(f"Sound response body: {sound_response.json()}")

water_spinners = Thread(target=trigger_water)
water_sound = Thread(target=play_sound)
water_spinners.start()
water_sound.start()
water_spinners.join()
water_sound.join()