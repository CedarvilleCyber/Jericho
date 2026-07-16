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

    go build -o datacenter-gui-rpi3 main.go
  '
```


