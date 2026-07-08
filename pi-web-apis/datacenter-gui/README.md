# Datacenter Display GUI

## Features
The GUI currently has two views. A basic view that displays
JERICHO similar to how the Matrix setup did and a view
that allows users to trigger the other physical effects.
**Note**: The trigger currently just check the health of the
other APIs

## Build Process
**Note**: The latest executable can be found in the datacenter-gui directory

The executable can be cross complied using docker with the following 
command

```bash
docker run --rm -v "$PWD":/app -w /app golang:1.26 /bin/bash -c "
  dpkg --add-architecture arm64 && \
  apt-get update && \
  apt-get install -y gcc-aarch64-linux-gnu \
                     libwayland-dev:arm64 \
                     libxkbcommon-dev:arm64 \
                     libvulkan-dev:arm64 \
                     libgles2-mesa-dev:arm64 \
                     libegl1-mesa-dev:arm64 \
                     libx11-xcb-dev:arm64 \
                     libxcursor-dev:arm64 \
                     libxfixes-dev:arm64 \
                     libxkbcommon-x11-dev:arm64 && \
  export PKG_CONFIG_PATH=/usr/lib/aarch64-linux-gnu/pkgconfig && \
  CGO_ENABLED=1 GOOS=linux GOARCH=arm64 CC=aarch64-linux-gnu-gcc go build -o datacenter-gui
"
```


