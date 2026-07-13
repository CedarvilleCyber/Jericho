/*
env GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0 go build -o nuclear-api main.go
*/

package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"periph.io/x/periph/conn/gpio"
	"periph.io/x/periph/conn/gpio/gpioreg"
	"periph.io/x/periph/host"
)

var (
	timeOfLastRequest time.Time
	previousDuration  time.Duration
	mutex             sync.Mutex
)

type routeInfo struct {
	Method      string
	Path        string
	Description string
}

var routes = []routeInfo{
	{Method: http.MethodGet, Path: "/health", Description: "health check"},
	{Method: http.MethodPost, Path: "/smoke", Description: "trigger smoke for a requested duration"},
	{Method: http.MethodPost, Path: "/trigger", Description: "trigger smoke for the default duration"},
}

func main() {
	// Initialize periph
	if _, err := host.Init(); err != nil {
		log.Fatal(err)
	}

	// Setup pins
	smokePin := gpioreg.ByName("GPIO21")
	if smokePin == nil {
		log.Fatal("Failed to find GPIO21")
	}
	if err := smokePin.Out(gpio.Low); err != nil {
		log.Fatal(err)
	}

	blinkPin := gpioreg.ByName("GPIO4")
	if blinkPin == nil {
		log.Fatal("Failed to find GPIO4")
	}
	if err := blinkPin.Out(gpio.Low); err != nil {
		log.Fatal(err)
	}

	// Start blinking goroutine
	go blink(blinkPin)

	// HTTP handlers
	mux := http.NewServeMux()
	mux.HandleFunc("/smoke", smokeHandler)
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/trigger", triggerHandler)

	printStartupRoutes()
	log.Println("Server starting on :8000")
	log.Fatal(http.ListenAndServe(":8000", loggingMiddleware(mux)))
}

func blink(pin gpio.PinOut) {
	for {
		pin.Out(gpio.High)
		time.Sleep(time.Second)
		pin.Out(gpio.Low)
		time.Sleep(time.Second)
	}
}

func reserveTrigger(duration time.Duration) bool {
	mutex.Lock()
	defer mutex.Unlock()

	if time.Since(timeOfLastRequest) < previousDuration+3*time.Second {
		return false
	}

	timeOfLastRequest = time.Now()
	previousDuration = duration
	return true
}

func smokeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	durationVal, ok := body["duration"]
	if !ok {
		http.Error(w, `{"error": "'duration' field is required"}`, http.StatusBadRequest)
		return
	}

	duration, ok := durationVal.(float64)
	if !ok {
		http.Error(w, `{"error": "'duration' must be a number"}`, http.StatusBadRequest)
		return
	}

	if duration <= 0 || duration > 15 {
		http.Error(w, `{"error": "'duration' must be between 0 and 15 seconds"}`, http.StatusBadRequest)
		return
	}

	if !reserveTrigger(time.Duration(duration * float64(time.Second))) {
		http.Error(w, `{"system busy": "Another request is being processed. Wait 5-10 seconds, then retry."}`, http.StatusTooManyRequests)
		return
	}

	// Trigger smoke
	go triggerSmoke(gpioreg.ByName("GPIO21"), previousDuration)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"Effect status": "triggered",
		"duration":      duration,
	})
	log.Printf("Executed POST /smoke duration=%.2fs", duration)
}

func triggerSmoke(pin gpio.PinOut, duration time.Duration) {
	pin.Out(gpio.High)
	time.Sleep(duration)
	pin.Out(gpio.Low)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	log.Println("Executed GET /health")
}

func triggerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	duration := 5 * time.Second

	if !reserveTrigger(duration) {
		http.Error(w, `{"system busy": "Another request is being processed. Wait 5-10 seconds, then retry."}`, http.StatusTooManyRequests)
		return
	}

	go triggerSmoke(gpioreg.ByName("GPIO21"), duration)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"Effect status": "triggered",
		"duration":      5,
	})
	log.Println("Executed POST /trigger duration=5s")

}

func printStartupRoutes() {
	log.Println("Nuclear API initialized")
	log.Println("Available routes:")
	for _, route := range routes {
		log.Printf("  %s %-10s %s", route.Method, route.Path, route.Description)
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("Started %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
		log.Printf("Completed %s %s in %s", r.Method, r.URL.Path, time.Since(start))
	})
}
