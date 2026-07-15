package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// DisplayRequest is the JSON body expected by the /api/display endpoint
type DisplayRequest struct {
	Text      string `json:"text"`
	Animation string `json:"animation"` // "fade", "slide", "zoom"
}

// DisplayResponse is returned after a successful display update
type DisplayResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

var validAnimations = map[string]bool{
	"fade":  true,
	"slide": true,
	"zoom":  true,
}

type Frontend interface {
	Dispatch(func())
	Eval(string)
}

// Start launches the HTTP API server on port 8080
func Start(w Frontend) {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/display", func(res http.ResponseWriter, req *http.Request) {
		res.Header().Set("Content-Type", "application/json")

		if req.Method != http.MethodPost {
			res.WriteHeader(http.StatusMethodNotAllowed)
			json.NewEncoder(res).Encode(DisplayResponse{false, "only POST is allowed"})
			return
		}

		var payload DisplayRequest
		if err := json.NewDecoder(req.Body).Decode(&payload); err != nil {
			res.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(res).Encode(DisplayResponse{false, "invalid JSON body"})
			return
		}

		if payload.Text == "" {
			res.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(res).Encode(DisplayResponse{false, "text field is required"})
			return
		}

		// Default to fade if animation is missing or invalid
		if !validAnimations[payload.Animation] {
			payload.Animation = "fade"
		}

		// Push update to the webview frontend
		w.Dispatch(func() {
			w.Eval(fmt.Sprintf(`showText(%q, %q)`, payload.Text, payload.Animation))
		})

		json.NewEncoder(res).Encode(DisplayResponse{true, "display updated"})
	})

	// Health check endpoint
	mux.HandleFunc("/api/health", func(res http.ResponseWriter, req *http.Request) {
		res.Header().Set("Content-Type", "application/json")
		json.NewEncoder(res).Encode(map[string]string{"status": "ok"})
	})

	log.Println("API server listening on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal("API server failed:", err)
	}
}
