# Matrix (Datacenter) API

## Features
The API has various endpoints to check health of the API, start and stop the API and
send text in various colors to the API. The specifics can be found below along with 
examples of API calls

## Build Process
**Note**: The latest executable can be found in the matrix-api directory

The executable can be cross complied for a raspberry pi running `armv71` using the 
following go build command. 

```bash
env GOOS=linux GOARCH=arm GOARM=7 go build -o matrix-api main.go
```

## Endpoints
### `GET /health`
Health check. Returns 200 OK if the API is responsive

**Response**
```json
{ "status": "ok" }
```

### `POST /start`
Start the idle function

**Response**
```json
{ "message": "idle started" }
```

### `POST /stop`
Start the idle function

**Response**
```json
{ "message": "idle stopped" }
```

### `POST /flash`
Display a message of 1-8 characters. The message will flash for 10 seconds.
Color is optional, defaulting to blue if non is provided

**Response**
```json
{"text": "text", "color": "color", "duration": "10 seconds"}
```
**Data Options** \
`Text: Any 1-8 characters` \
`Color(optional): R, G, or B(default)` \
**Note**: You can pass multiple colors and get various shades


## Examples
```bash
curl -X POST http://localhost:8000/stop

curl http://localhost:8000/health

curl http://localhost:8000/flash -H "Content-Type: application/json" \
      -d '{"text":"hello"}'
curl http://localhost:8000/flash -H "Content-Type: application/json" \
      -d '{"text":"hello", "color": "R"}'
```