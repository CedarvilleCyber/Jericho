/*
!Vibe coded with AI
env GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0 go build -o sound-api main_ai.go
*/

package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const SOUND_DIR = "/opt/sound-api/sounds"

var (
	availableSounds []string
	lastRequestTime time.Time
	mu              sync.Mutex
)

type PlayRequest struct {
	Sound    string   `json:"sound"`
	Duration *float64 `json:"duration,omitempty"`
}

type PlayResponse struct {
	Ok       bool   `json:"ok"`
	Sound    string `json:"sound"`
	Duration string `json:"duration"`
}

type SoundsResponse struct {
	Ok     bool     `json:"ok"`
	Sounds []string `json:"sounds"`
	Count  int      `json:"count"`
}

type ErrorResponse struct {
	Error           string   `json:"error,omitempty"`
	AvailableSounds []string `json:"available_sounds,omitempty"`
	SystemBusy      string   `json:"system busy,omitempty"`
}

func playSound(sound string, duration *float64) {
	filepath := filepath.Join(SOUND_DIR, sound)
	cmd := exec.Command("aplay", filepath)
	cmd.Run() // TODO: handle duration-based looping
}

func validateRequest(req PlayRequest) (string, int) {
	mu.Lock()
	defer mu.Unlock()

	if time.Since(lastRequestTime) < 8*time.Second {
		return "system busy: Another request is being processed. Wait a few seconds, then retry.", 429
	}
	lastRequestTime = time.Now()

	if req.Sound == "" {
		return "'sound' field is required", 400
	}

	if !strings.HasSuffix(req.Sound, ".wav") {
		return "'sound' must be a .wav file", 400
	}

	for _, s := range availableSounds {
		if s == req.Sound {
			return "", 200
		}
	}

	return fmt.Sprintf("Sound '%s' not available", req.Sound), 400
}

func populateAvailableSounds() {
	if _, err := os.Stat(SOUND_DIR); os.IsNotExist(err) {
		fmt.Printf("Warning: Sound directory does not exist: %s\n", SOUND_DIR)
		return
	}

	files, err := os.ReadDir(SOUND_DIR)
	if err != nil {
		fmt.Printf("Error reading sound directory: %v\n", err)
		return
	}

	availableSounds = nil
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".wav") {
			availableSounds = append(availableSounds, file.Name())
		}
	}

	sort.Strings(availableSounds)
	fmt.Printf("Loaded %d sounds from %s\n", len(availableSounds), SOUND_DIR)
}

func playHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PlayRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Request body must be a JSON object", http.StatusBadRequest)
		return
	}

	errorMsg, status := validateRequest(req)
	if status != 200 {
		resp := ErrorResponse{}
		if status == 429 {
			resp.SystemBusy = errorMsg
		} else {
			resp.Error = errorMsg
			if strings.Contains(errorMsg, "not available") {
				resp.AvailableSounds = availableSounds
			}
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		json.NewEncoder(w).Encode(resp)
		return
	}

	go playSound(req.Sound, req.Duration)

	durationStr := "once"
	if req.Duration != nil {
		durationStr = fmt.Sprintf("%.2f", *req.Duration)
	}

	resp := PlayResponse{
		Ok:       true,
		Sound:    req.Sound,
		Duration: durationStr,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func soundsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	resp := SoundsResponse{
		Ok:     true,
		Sounds: availableSounds,
		Count:  len(availableSounds),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	populateAvailableSounds()

	http.HandleFunc("/play", playHandler)
	http.HandleFunc("/sounds", soundsHandler)
	http.HandleFunc("/health", healthHandler)

	fmt.Println("Server starting on :8000")
	http.ListenAndServe(":8000", nil)
}
