# Datacenter Display GUI

## Features
The GUI has three views. A basic view that displays
the Jericho logo on a spinning coin, a view
that allows users to trigger the other physical effects, 
and a view that displays the livestreams.

The display works like a kiosk hiding the menu until prompted then
switching back to basic view after a minute of inactivity

## Build Process
**Note**: The latest executable can be found in the datacenter-gui directory

The executable can be cross complied using docker with the following 
command

```bash
docker run --rm \
  -v "$PWD":/app \
  -w /app \
  golang:1.26-bookworm \
  bash -c '
    dpkg --add-architecture armhf &&
    apt-get update &&
    apt-get install -y \
      gcc-arm-linux-gnueabihf \
      g++-arm-linux-gnueabihf \
      pkg-config \
      libgtk-3-dev:armhf \
      libwebkit2gtk-4.0-dev:armhf &&

    export CGO_ENABLED=1
    export GOOS=linux
    export GOARCH=arm
    export GOARM=7
    export CC=arm-linux-gnueabihf-gcc
    export CXX=arm-linux-gnueabihf-g++
    export PKG_CONFIG_ALLOW_CROSS=1
    export PKG_CONFIG_LIBDIR=/usr/lib/arm-linux-gnueabihf/pkgconfig:/usr/share/pkgconfig

    go build -o datacenter-gui main.go
  '
```

## Endpoints
### `GET /health`
Health check. Returns 200 OK if the API is responsive.

**Response:**
```json
{ "status": "ok" }
```

### `POST /display`
Animates text onto the screen using various animation options

**Response:**
```json
{ "status": "ok", "message": "display updated"}
```

**Data Options** \
`Text: any text` \
`Animation: fade(default), slide, zoom`

## Examples
```bash
curl http://localhost:8000/health

curl http://local:8000/display -H "Content-Type: application/json" \
      -d '{"text": "anything", "animation": "zoom"}'
      
curl http://local:8000/display -H "Content-Type: application/json" \
      -d '{"text": "anything"}'
```



