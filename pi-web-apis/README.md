# Overview
This README document walks through the process of setting up one of these API
services on a Raspberry Pi

All the APIs are written in Go and use the same build command

All APIs are exposed on port 8000

---

## Building and Running

### Prerequisites
- Go 1.21+
- Raspberry Pi with periph.io support
- Required Go packages: gin-gonic/gin, periph.io

---

Move to the directory of the API you wish to build

Ensure you have the go modules
```bash
go mod download
```

Build the executable with the following command, replacing the output name with the respective API
```bash
env GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0 go build -o (name)-api main.go # Build command on local machine
```
Once you have the updated executable scp it over to the respective Raspberry Pi.

```bash
scp (name)-api username@password:/path/on/pi
```
**Note:** Jericho Team check the manual for ips, credentials and tips for moving files

Make sure to replace the existing executable on the Pi with the one you moved over

With the executable on the Pi you can restart the scenario service to run the new executable. 
You may also run it manually with the following command

```bash
./(name)-api
```

If the file is not executable by defualt change its permissions with the following

```bash
chmod 755 (name)-api
```