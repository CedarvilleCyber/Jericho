/*
Description:
This API is meant to be run on the Raspberry Pi controlling the traffic lights.
The API allows calls to be made to control traffic light states.

GPIO Pin Configuration:
- North-South Direction:
  - GPIO 5:  Red Light
  - GPIO 6:  Yellow Light
  - GPIO 13: Green Light

- East-West Direction:
  - GPIO 16: Red Light
  - GPIO 20: Yellow Light
  - GPIO 21: Green Light

Note: LEDs use common anode, so GPIO High = LED Off, GPIO Low = LED On
env GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0 go build -o traffic-api main.go
*/

//package main

import (
	"fmt"
	// "sync"
	"time"

	"github.com/gin-gonic/gin"
	"periph.io/x/conn/v3/gpio"
	"periph.io/x/host/v3"
	"periph.io/x/host/v3/rpi"
)

// LightState represents the current state of a traffic light
type LightState struct {
	RedOn    bool `json:"red"`
	YellowOn bool `json:"yellow"`
	GreenOn  bool `json:"green"`
}

// TrafficLightState represents the complete traffic light system state
type TrafficLightState struct {
	NorthSouth LightState `json:"north_south"`
	EastWest   LightState `json:"east_west"`
	IdleActive bool       `json:"idle_active"`
	Step       int        `json:"step"`
}

// GPIO Pin definitions
var (
	// North-South
	NS_Red    gpio.PinOut = rpi.P1_29 // GPIO 5
	NS_Yellow gpio.PinOut = rpi.P1_31 // GPIO 6
	NS_Green  gpio.PinOut = rpi.P1_33 // GPIO 13

	// East-West
	EW_Red    gpio.PinOut = rpi.P1_36 // GPIO 16
	EW_Yellow gpio.PinOut = rpi.P1_38 // GPIO 20
	EW_Green  gpio.PinOut = rpi.P1_40 // GPIO 21
)

// Global state
var (
	// stateMutex  sync.Mutex
	idleActive  bool = true
	currentStep int

	// Track current light state for API responses
	nsRed    bool
	nsYellow bool
	nsGreen  bool
	ewRed    bool
	ewYellow bool
	ewGreen  bool
)

func main() {
	// Initialize periph.io host
	if _, err := host.Init(); err != nil {
		fmt.Printf("Failed to initialize host: %v\n", err)
		return
	}

	// Initialize all GPIO pins as outputs
	pins := []gpio.PinOut{NS_Red, NS_Yellow, NS_Green, EW_Red, EW_Yellow, EW_Green}
	for _, pin := range pins {
		if err := pin.Out(gpio.High); err != nil {
			fmt.Printf("Failed to initialize GPIO pin: %v\n", err)
			return
		}
	}

	// Start idle loop in goroutine
	go func() {
		for {
			if idleActive {
				runTrafficCycle()
			} else {
				runFlashMode()
			}
		}
	}()

	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Get current state
	router.GET("/state", func(c *gin.Context) {
		state := TrafficLightState{
			NorthSouth: LightState{
				RedOn:    nsRed,
				YellowOn: nsYellow,
				GreenOn:  nsGreen,
			},
			EastWest: LightState{
				RedOn:    ewRed,
				YellowOn: ewYellow,
				GreenOn:  ewGreen,
			},
			IdleActive: idleActive,
			Step:       currentStep,
		}
		c.JSON(200, state)
	})

	// Idle control endpoints
	router.POST("/idle/start", func(c *gin.Context) {
		idleActive = true
		c.JSON(200, gin.H{"message": "idle started"})
	})

	router.POST("/idle/stop", func(c *gin.Context) {
		idleActive = false
		clearAllLights()
		c.JSON(200, gin.H{"message": "idle stopped"})
	})

	router.Run("0.0.0.0:8000")
}

// setPin sets a GPIO pin on or off (inverted for common anode)
func setPin(pin gpio.PinOut, on bool) error {
	// Invert the value because LEDs have common anode
	if on {
		return pin.Out(gpio.Low)
	}
	return pin.Out(gpio.High)
}

// setAllLights sets all lights to a specific state (one color on)
func setAllLights(red, yellow, green bool) {
	nsRed, nsYellow, nsGreen = red, yellow, green
	ewRed, ewYellow, ewGreen = red, yellow, green

	setPin(NS_Red, red)
	setPin(NS_Yellow, yellow)
	setPin(NS_Green, green)
	setPin(EW_Red, red)
	setPin(EW_Yellow, yellow)
	setPin(EW_Green, green)
}

// clearAllLights turns off all lights
func clearAllLights() {
	setAllLights(false, false, false)
}

// runTrafficCycle runs the normal traffic light sequence
func runTrafficCycle() {
	// Step 0: RED North-South, GREEN East-West
	currentStep = 0
	nsRed, nsYellow, nsGreen = true, false, false
	ewRed, ewYellow, ewGreen = false, false, true

	setPin(NS_Red, true)
	setPin(NS_Yellow, false)
	setPin(NS_Green, false)
	setPin(EW_Red, false)
	setPin(EW_Yellow, false)
	setPin(EW_Green, true)
	time.Sleep(5 * time.Second)

	// Step 1: YELLOW East-West

	currentStep = 1
	ewYellow = true
	ewGreen = false

	setPin(EW_Yellow, true)
	setPin(EW_Green, false)
	time.Sleep(1 * time.Second)

	// Step 2: GREEN North-South, RED East-West
	currentStep = 2
	nsRed, nsYellow, nsGreen = false, false, true
	ewRed, ewYellow, ewGreen = true, false, false

	setPin(NS_Red, false)
	setPin(NS_Yellow, false)
	setPin(NS_Green, true)
	setPin(EW_Red, true)
	setPin(EW_Yellow, false)
	setPin(EW_Green, false)
	time.Sleep(5 * time.Second)

	// Step 3: YELLOW North-South
	currentStep = 3
	nsYellow = true
	nsGreen = false

	setPin(NS_Yellow, true)
	setPin(NS_Green, false)
	time.Sleep(1 * time.Second)
}

// runFlashMode runs all lights in red flash mode (alternating on/off)
func runFlashMode() {
	nsRed, nsYellow, nsGreen = true, false, false
	ewRed, ewYellow, ewGreen = true, false, false

	setPin(NS_Red, true)
	setPin(NS_Yellow, false)
	setPin(NS_Green, false)
	setPin(EW_Red, true)
	setPin(EW_Yellow, false)
	setPin(EW_Green, false)
	time.Sleep(1 * time.Second)

	nsRed, nsYellow, nsGreen = false, false, false
	ewRed, ewYellow, ewGreen = false, false, false

	clearAllLights()
	time.Sleep(1 * time.Second)
}
