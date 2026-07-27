package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strings"
	"time"

	"jericho/datacenter-gui/server"
	"jericho/datacenter-gui/ui"

	"github.com/webview/webview_go"
)

type TriggerResult struct {
	Name       string `json:"name"`
	StatusCode int    `json:"statusCode"`
	Body       string `json:"body"`
}

type Sound struct {
	Sound string `json:"sound"`
}

func main() {
	debug := flag.Bool("debug", false, "enable webview developer tools when supported")
	flag.Parse()

	// Find a free port to serve the embedded UI files locally
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal("failed to find a free port:", err)
	}

	// Serve embedded UI files on the internal port
	go func() {
		if err := http.Serve(ln, http.FileServer(http.FS(ui.Files))); err != nil {
			log.Fatal("ui file server failed:", err)
		}
	}()

	uiURL := fmt.Sprintf("http://%s", ln.Addr())
	log.Println("UI served at:", uiURL)

	w := webview.New(*debug)
	defer w.Destroy()

	w.SetTitle("Datacenter Display")
	w.SetSize(800, 1280, webview.HintNone)
	if err := w.Bind("triggerEffect", triggerEffect); err != nil {
		log.Fatal("failed to bind triggerEffect:", err)
	}
	w.Navigate(uiURL)

	go server.Start(w)

	w.Run()
}

func triggerEffect(name string) (TriggerResult, error) {
	targets := map[string]string{
		"nuclear": "http://nuclear.jericho.local/trigger",
		"traffic": "http://traffic.jericho.local/trigger",
		"water":   "http://water.jericho.local/trigger",
		"sound":   "http://sound.jericho.local/trigger",
	}

	sounds := map[string]Sound{
		"nuclear": {Sound: "nuclear5.wav"},
		"traffic": {Sound: "traffic5.wav"},
		"water":   {Sound: "water5.wav"},
	}

	key := strings.ToLower(strings.TrimSpace(name))
	url, ok := targets[key]
	if !ok {
		return TriggerResult{}, fmt.Errorf("unknown trigger %q", name)
	}

	client := &http.Client{Timeout: 20 * time.Second}

	result := TriggerResult{}

	go func(result TriggerResult) (TriggerResult, error) {
		resp, err := client.Post(url, "application/json", nil)
		if err != nil {
			return TriggerResult{}, fmt.Errorf("failed to trigger %s: %w", key, err)
		}

		defer resp.Body.Close()

		body, err := io.ReadAll(io.LimitReader(resp.Body, 4096))
		if err != nil {
			return TriggerResult{}, fmt.Errorf("failed to read %s response: %w", key, err)
		}

		result = TriggerResult{
			Name:       key,
			StatusCode: resp.StatusCode,
			Body:       string(body),
		}

		if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
			return result, fmt.Errorf("%s trigger returned HTTP %d: %s", key, resp.StatusCode, strings.TrimSpace(result.Body))
		}

		log.Printf("Triggered %s effect: HTTP %d", key, resp.StatusCode)
		return result, nil
	}(result)

	result2 := TriggerResult{}

	go func(result TriggerResult) (TriggerResult, error) {
		sound := sounds[key]
		jsonBytes, err := json.Marshal(sound)

		resp2, err := client.Post("http://sound.jericho.local/play", "application/json", bytes.NewBuffer(jsonBytes))
		if err != nil {
			return TriggerResult{}, fmt.Errorf("failed to trigger %s: %w", key, err)
		}
		defer resp2.Body.Close()

		if resp2.StatusCode < http.StatusOK || resp2.StatusCode >= http.StatusMultipleChoices {
			return result, fmt.Errorf("%s trigger returned HTTP %d: %s", key, resp2.StatusCode, strings.TrimSpace(result.Body))
		}

		log.Printf("Triggered %s sound: HTTP %d", key, resp2.StatusCode)
		return result, nil
	}(result2)

	return result, nil
}
