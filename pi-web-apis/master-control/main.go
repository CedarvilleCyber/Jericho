/*
Description:
This program runs on master-control (the proxy server). It acts as a Modbus TCP
server and translates incoming holding register writes into HTTP calls to the
appropriate Pi API.

Register Map:
  100  NUCLEAR_SMOKE_TRIGGER  Write 1-15 (seconds) to trigger smoke. Auto-resets to 0.
  101  NUCLEAR_SMOKE_STATUS   Read-only status: 0=idle, 1=ok, 2=busy, 3=error

  200-299  reserved for sound API
  300-399  reserved for water API
  400-499  reserved for traffic API

To add a new API, add a case to dispatch() and implement the corresponding call.
*/
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/simonvetter/modbus"
)

// Status codes written to status registers so Modbus clients can poll results.
const (
	statusIdle  uint16 = 0
	statusOK    uint16 = 1
	statusBusy  uint16 = 2
	statusError uint16 = 3
)

// Register addresses.
const (
	regNuclearSmokeTrigger uint16 = 100
	regNuclearSmokeStatus  uint16 = 101
)

// handler implements modbus.RequestHandler. It maintains its own register bank
// and dispatches HTTP calls when trigger registers are written.
type handler struct {
	mu         sync.RWMutex
	registers  [65536]uint16
	nuclearURL string
}

func (h *handler) getReg(addr uint16) uint16 {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.registers[addr]
}

func (h *handler) setReg(addr uint16, val uint16) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.registers[addr] = val
}

// HandleCoils — not used; return illegal function so clients get a clear error.
func (h *handler) HandleCoils(_ *modbus.CoilsRequest) ([]bool, error) {
	return nil, modbus.ErrIllegalFunction
}

// HandleDiscreteInputs — not used.
func (h *handler) HandleDiscreteInputs(_ *modbus.DiscreteInputsRequest) ([]bool, error) {
	return nil, modbus.ErrIllegalFunction
}

// HandleInputRegisters — not used.
func (h *handler) HandleInputRegisters(_ *modbus.InputRegistersRequest) ([]uint16, error) {
	return nil, modbus.ErrIllegalFunction
}

// HandleHoldingRegisters handles FC3 (read) and FC6/FC16 (write) requests.
// On writes, non-zero values in trigger registers kick off API calls.
func (h *handler) HandleHoldingRegisters(req *modbus.HoldingRegistersRequest) ([]uint16, error) {
	if req.IsWrite {
		for i, val := range req.Args {
			addr := req.Addr + uint16(i)
			h.setReg(addr, val)
			if val != 0 {
				h.dispatch(addr, val)
			}
		}
		return nil, nil
	}

	// Read path: return register values from our bank.
	result := make([]uint16, req.Quantity)
	h.mu.RLock()
	for i := uint16(0); i < req.Quantity; i++ {
		result[i] = h.registers[req.Addr+i]
	}
	h.mu.RUnlock()
	return result, nil
}

// dispatch routes a register write to the appropriate API call.
// Extend this switch to add new APIs.
func (h *handler) dispatch(addr, val uint16) {
	switch addr {
	case regNuclearSmokeTrigger:
		h.setReg(regNuclearSmokeStatus, statusIdle)
		go h.callNuclearSmoke(val)
	}
}

// callNuclearSmoke POSTs to the nuclear API /smoke endpoint.
// The value written to the trigger register is the smoke duration in seconds.
func (h *handler) callNuclearSmoke(value uint16) {
	duration := int(value)
	if duration < 1 || duration > 15 {
		log.Printf("[nuclear/smoke] invalid duration %d (must be 1-15)", duration)
		h.setReg(regNuclearSmokeStatus, statusError)
		return
	}

	log.Printf("[nuclear/smoke] triggering for %d seconds", duration)

	payload, _ := json.Marshal(map[string]int{"duration": duration})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, h.nuclearURL+"/smoke", bytes.NewReader(payload))
	if err != nil {
		log.Printf("[nuclear/smoke] failed to build request: %v", err)
		h.setReg(regNuclearSmokeStatus, statusError)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("[nuclear/smoke] http error: %v", err)
		h.setReg(regNuclearSmokeStatus, statusError)
		return
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		log.Printf("[nuclear/smoke] success")
		h.setReg(regNuclearSmokeStatus, statusOK)
	case http.StatusTooManyRequests:
		log.Printf("[nuclear/smoke] system busy (429) — wait a few seconds and retry")
		h.setReg(regNuclearSmokeStatus, statusBusy)
	default:
		log.Printf("[nuclear/smoke] unexpected HTTP %d", resp.StatusCode)
		h.setReg(regNuclearSmokeStatus, statusError)
	}
}

func main() {
	portFlag := flag.Int("port", 5020, "Modbus TCP listen port")
	nuclearURLFlag := flag.String("nuclear-url", "http://192.0.2.101:8000", "Nuclear API base URL")
	flag.Parse()

	nuclearURL := *nuclearURLFlag
	if env := os.Getenv("NUCLEAR_URL"); env != "" {
		nuclearURL = env
	}

	modbusPort := *portFlag
	if env := os.Getenv("MODBUS_PORT"); env != "" {
		if _, err := fmt.Sscan(env, &modbusPort); err != nil {
			log.Fatalf("invalid MODBUS_PORT %q: %v", env, err)
		}
	}

	h := &handler{nuclearURL: nuclearURL}

	server, err := modbus.NewServer(&modbus.ServerConfiguration{
		URL:        fmt.Sprintf("tcp://0.0.0.0:%d", modbusPort),
		MaxClients: 10,
	}, h)
	if err != nil {
		log.Fatalf("failed to create Modbus server: %v", err)
	}

	if err := server.Start(); err != nil {
		log.Fatalf("failed to start Modbus server: %v", err)
	}
	defer server.Stop()

	log.Printf("master-control listening on port %d (Modbus TCP)", modbusPort)
	log.Printf("nuclear API: %s", nuclearURL)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down")
}
