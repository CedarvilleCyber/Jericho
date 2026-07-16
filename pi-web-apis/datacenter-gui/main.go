package main

import (
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
	w.SetSize(1280, 720, webview.HintNone)
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

	key := strings.ToLower(strings.TrimSpace(name))
	url, ok := targets[key]
	if !ok {
		return TriggerResult{}, fmt.Errorf("unknown trigger %q", name)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(url, "application/json", nil)
	if err != nil {
		return TriggerResult{}, fmt.Errorf("failed to trigger %s: %w", key, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 4096))
	if err != nil {
		return TriggerResult{}, fmt.Errorf("failed to read %s response: %w", key, err)
	}

	result := TriggerResult{
		Name:       key,
		StatusCode: resp.StatusCode,
		Body:       string(body),
	}

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return result, fmt.Errorf("%s trigger returned HTTP %d: %s", key, resp.StatusCode, strings.TrimSpace(result.Body))
	}

	log.Printf("Triggered %s effect: HTTP %d", key, resp.StatusCode)
	return result, nil
}
