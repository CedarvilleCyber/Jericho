package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"

	"jericho/datacenter-gui/server"
	"jericho/datacenter-gui/ui"

	"github.com/webview/webview_go"
)

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
	w.Navigate(uiURL)

	go server.Start(w)

	w.Run()
}
