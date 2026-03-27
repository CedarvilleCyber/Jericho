#!/usr/bin/env python3
"""
stream.py — Creates a fresh YouTube liveStream + liveBroadcast on every run,
writes the stream key, then launches ffmpeg.sh. Designed to be called by a
systemd service that restarts on failure/power loss.
"""

import datetime
import subprocess
import socket
import sys
import time

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR    = "/home/jericho/youtube-streamer"
TOKEN_FILE  = f"{BASE_DIR}/token.json"
KEY_FILE    = f"{BASE_DIR}/stream_key.txt"
FFMPEG_SH   = f"{BASE_DIR}/ffmpeg.sh"
SCOPES      = ["https://www.googleapis.com/auth/youtube.force-ssl"]

BROADCAST_TITLE    = "Jericho Nuclear Power Plant Stream"
STREAM_TITLE       = "Jericho NPS Ingest"
PRIVACY_STATUS     = "public"          # "public" | "unlisted" | "private"
LATENCY_PREFERENCE = "ultraLow"        # "ultraLow" | "low" | "normal"
# ──────────────────────────────────────────────────────────────────────────────


def wait_for_internet(host="8.8.8.8", port=53, interval=5):
    """Block until a TCP connection to host:port succeeds."""
    print("Waiting for internet connection…", flush=True)
    while True:
        try:
            socket.create_connection((host, port), timeout=5)
            print("Internet is up.", flush=True)
            return
        except OSError:
            time.sleep(interval)


def build_youtube_client():
    creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    return build("youtube", "v3", credentials=creds)


def create_live_stream(youtube):
    """
    Create a brand-new liveStream resource (ingest endpoint + stream key).
    Setting isReusable=False ensures YouTube treats this as a completely
    fresh ingest point and will not carry over DVR state from a prior session.
    """
    response = youtube.liveStreams().insert(
        part="snippet,cdn,contentDetails",
        body={
            "snippet": {
                "title": STREAM_TITLE,
            },
            "cdn": {
                "frameRate":    "variable",
                "ingestionType": "rtmp",
                "resolution":   "variable",
            },
            "contentDetails": {
                "isReusable": False,   # ← key: prevents DVR bleed-over
            },
        },
    ).execute()

    stream_id  = response["id"]
    stream_key = response["cdn"]["ingestionInfo"]["streamName"]
    print(f"Created liveStream  id={stream_id}", flush=True)
    return stream_id, stream_key


def create_broadcast(youtube):
    """
    Create a liveBroadcast with DVR explicitly disabled.
    enableAutoStart/Stop let ffmpeg control the broadcast lifecycle without
    needing a separate API call to transition to 'live'.
    """
    # Schedule 60 s in the future so YouTube has time to process the binding.
    start_time = (
        datetime.datetime.utcnow() + datetime.timedelta(seconds=60)
    ).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    response = youtube.liveBroadcasts().insert(
        part="snippet,status,contentDetails",
        body={
            "snippet": {
                "title":              BROADCAST_TITLE,
                "scheduledStartTime": start_time,
            },
            "status": {
                "privacyStatus": PRIVACY_STATUS,
            },
            "contentDetails": {
                "enableAutoStart":    True,
                "enableAutoStop":     True,
                "enableDvr":          False,   # ← DVR off, every time
                "latencyPreference":  LATENCY_PREFERENCE,
            },
        },
    ).execute()

    broadcast_id = response["id"]
    print(f"Created liveBroadcast id={broadcast_id}", flush=True)
    return broadcast_id


def bind_stream_to_broadcast(youtube, broadcast_id, stream_id):
    youtube.liveBroadcasts().bind(
        part="id,contentDetails",
        id=broadcast_id,
        streamId=stream_id,
    ).execute()
    print(f"Bound stream {stream_id} → broadcast {broadcast_id}", flush=True)


def end_broadcast(youtube, broadcast_id):
    """Best-effort: mark the broadcast complete so it doesn't sit open."""
    try:
        youtube.liveBroadcasts().transition(
            broadcastStatus="complete",
            id=broadcast_id,
            part="id,status",
        ).execute()
        print(f"Broadcast {broadcast_id} marked complete.", flush=True)
    except HttpError as e:
        # Non-fatal — YouTube may have already ended it via enableAutoStop.
        print(f"Could not transition broadcast to complete: {e}", flush=True)


def main():
    wait_for_internet()

    youtube = build_youtube_client()

    # 1. Fresh ingest stream (new key, no DVR carry-over)
    stream_id, stream_key = create_live_stream(youtube)

    # 2. Write the key so ffmpeg.sh can read it
    with open(KEY_FILE, "w") as fh:
        fh.write(stream_key)
    print("Stream key written to stream_key.txt", flush=True)

    # 3. New broadcast with DVR off
    broadcast_id = create_broadcast(youtube)

    # 4. Wire them together
    bind_stream_to_broadcast(youtube, broadcast_id, stream_id)

    print(f"Setup complete. Launching {FFMPEG_SH} …", flush=True)

    # 5. Run ffmpeg — this blocks until ffmpeg exits (crash, SIGTERM, etc.)
    result = subprocess.run([FFMPEG_SH])

    print(f"ffmpeg exited with code {result.returncode}", flush=True)

    # 6. Clean up the broadcast
    end_broadcast(youtube, broadcast_id)

    # Propagate non-zero exit so systemd knows to restart
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
