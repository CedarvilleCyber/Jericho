# Matrix (Datacenter) API


## Endpoints
### `GET /health`
Health check. Returns 200 OK if the API is responsive

**Response**
```json
{ "status": "ok" }
```

### `POST /idle/start`
Start the idle function

**Response**
```json
{ "message": "idle started" }
```

### `POST /idle/stop`
Start the idle function

**Response**
```json
{ "message": "idle stopped" }
```

### `POST /flash?text=&color=`
Display a message of 1-8 characters. The message will flash for 10 seconds.
Color is optional, defaulting to blue if non is provided

**Response**
```json
{"text": "text", "color": "color", "duration": "10 seconds"}
```

## Examples
```bash
curl -X POST http://localhost:8000/idle/stop

curl http://localhost:8000/health

curl -X POST http://localhost:8000/flash?text=hello

curl -X POST "http://localhost:8000/flash?text=hello&color=G"
```