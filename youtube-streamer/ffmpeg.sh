#!/bin/bash
set -euo pipefail

KEY_FILE="/home/jericho/youtube-streamer/stream_key.txt"

if [[ ! -f "$KEY_FILE" ]]; then
    echo "Stream key file not found: $KEY_FILE" >&2
    exit 1
fi

KEY=$(cat "$KEY_FILE")

# Set white balance
#v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_automatic=0
#v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_temperature=2800

sleep 1
exec ffmpeg \
-f v4l2 \
-input_format mjpeg \
-video_size 1280x720 \
-framerate 30 \
-i /dev/video0 \
-f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
-c:v libx264 \
-preset veryfast \
-tune zerolatency \
-pix_fmt yuv420p \
-profile:v high \
-level 4.1 \
-g 60 \
-keyint_min 60 \
-sc_threshold 0 \
-force_key_frames "expr:gte(t,n_forced*2)" \
-b:v 2500k \
-maxrate 2500k \
-bufsize 5000k \
-c:a aac \
-b:a 128k \
-ar 44100 \
-ac 2 \
-f flv "rtmp://a.rtmp.youtube.com/live2/${KEY}"
