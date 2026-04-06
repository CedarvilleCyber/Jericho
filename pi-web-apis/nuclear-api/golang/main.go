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
	http.HandleFunc("/smoke", smokeHandler)
	http.HandleFunc("/health", healthHandler)

	log.Println("nuclear API initialized")
	log.Fatal(http.ListenAndServe(":8000", nil))
}

func blink(pin gpio.PinOut) {
	for {
		pin.Out(gpio.High)
		time.Sleep(time.Second)
		pin.Out(gpio.Low)
		time.Sleep(time.Second)
	}
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

	// Validation
	mutex.Lock()
	defer mutex.Unlock()

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

	if time.Since(timeOfLastRequest) < previousDuration+3*time.Second {
		http.Error(w, `{"system busy": "Another request is being processed. Wait 5-10 seconds, then retry."}`, http.StatusTooManyRequests)
		return
	}

	timeOfLastRequest = time.Now()
	previousDuration = time.Duration(duration * float64(time.Second))

	// Trigger smoke
	go triggerSmoke(gpioreg.ByName("GPIO21"), previousDuration)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"Effect status": "triggered",
		"duration":      duration,
	})
}

func triggerSmoke(pin gpio.PinOut, duration time.Duration) {
	pin.Out(gpio.High)
	time.Sleep(duration)
	pin.Out(gpio.Low)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
