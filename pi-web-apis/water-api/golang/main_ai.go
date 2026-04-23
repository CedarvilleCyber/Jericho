/*
Description:
This API is meant to run on the Raspberry Pi controlling the water clarifier arms.
The API allows calls to start/stop the idle spinning and check service health.

GPIO Pin Configuration:
- Arm 1 Stepper Outputs: GPIO 6, 13, 19, 26
- Arm 2 Stepper Outputs: GPIO 12, 16, 20, 21
- Water tower LED: GPIO 4

Note: Outputs are active-high. gpio.High turns a pin on, gpio.Low turns it off.
!Vibe coded with AI
env GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0 go build -o water-api main_ai.go
*/

package main

import (
	"fmt"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"periph.io/x/conn/v3/gpio"
	"periph.io/x/host/v3"
	"periph.io/x/host/v3/rpi"
)

var (
	arm1Pins = []gpio.PinOut{
		rpi.P1_31, // GPIO 6
		rpi.P1_33, // GPIO 13
		rpi.P1_35, // GPIO 19
		rpi.P1_37, // GPIO 26
	}

	arm2Pins = []gpio.PinOut{
		rpi.P1_32, // GPIO 12
		rpi.P1_36, // GPIO 16
		rpi.P1_38, // GPIO 20
		rpi.P1_40, // GPIO 21
	}

	waterLED gpio.PinOut = rpi.P1_7 // GPIO 4

	sequence = [8][4]bool{
		{true, false, false, false},
		{true, true, false, false},
		{false, true, false, false},
		{false, true, true, false},
		{false, false, true, false},
		{false, false, true, true},
		{false, false, false, true},
		{true, false, false, true},
	}

	stateMutex     sync.RWMutex
	idleArm1Active bool = true
	idleArm2Active bool = true
	currentStep1   int
	currentStep2   int
)

type WaterState struct {
	Arm1Active   bool `json:"arm1_active"`
	Arm2Active   bool `json:"arm2_active"`
	CurrentStep1 int  `json:"current_step_1"`
	CurrentStep2 int  `json:"current_step_2"`
}

func main() {
	if _, err := host.Init(); err != nil {
		fmt.Printf("Failed to initialize host: %v\n", err)
		return
	}

	pins := append(append([]gpio.PinOut{}, arm1Pins...), arm2Pins...)
	pins = append(pins, waterLED)

	for _, pin := range pins {
		if err := pin.Out(gpio.Low); err != nil {
			fmt.Printf("Failed to initialize GPIO pin: %v\n", err)
			return
		}
	}

	go idleLoop()
	go waterTowerLED()

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	router.GET("/state", func(c *gin.Context) {
		stateMutex.RLock()
		state := WaterState{Arm1Active: idleArm1Active, Arm2Active: idleArm2Active, CurrentStep1: currentStep1, CurrentStep2: currentStep2}
		stateMutex.RUnlock()
		c.JSON(200, state)
	})

	router.GET("/start", func(c *gin.Context) {
		stateMutex.Lock()
		idleArm1Active = true
		idleArm2Active = true
		stateMutex.Unlock()
		c.JSON(200, gin.H{"message": "idle started for both arms"})
	})

	router.GET("/stop", func(c *gin.Context) {
		stateMutex.Lock()
		idleArm1Active = false
		idleArm2Active = false
		stateMutex.Unlock()
		clearAll()
		c.JSON(200, gin.H{"message": "idle stopped for both arms"})
	})

	router.GET("/arm1/start", func(c *gin.Context) {
		stateMutex.Lock()
		idleArm1Active = true
		stateMutex.Unlock()
		c.JSON(200, gin.H{"message": "idle started for arm1"})
	})

	router.GET("/arm1/stop", func(c *gin.Context) {
		stateMutex.Lock()
		idleArm1Active = false
		stateMutex.Unlock()
		clearGroupPins(arm1Pins)
		c.JSON(200, gin.H{"message": "idle stopped for arm1"})
	})

	router.GET("/arm2/start", func(c *gin.Context) {
		stateMutex.Lock()
		idleArm2Active = true
		stateMutex.Unlock()
		c.JSON(200, gin.H{"message": "idle started for arm2"})
	})

	router.GET("/arm2/stop", func(c *gin.Context) {
		stateMutex.Lock()
		idleArm2Active = false
		stateMutex.Unlock()
		clearGroupPins(arm2Pins)
		c.JSON(200, gin.H{"message": "idle stopped for arm2"})
	})

	router.Run("0.0.0.0:8000")
}

func idleLoop() {
	for {

		if !idleArm1Active && !idleArm2Active {
			time.Sleep(200 * time.Millisecond)
			continue
		}

		if idleArm1Active {
			setGroupPins(arm1Pins, sequence[currentStep1])
		}
		if idleArm2Active {
			setGroupPins(arm2Pins, sequence[currentStep2])
		}

		stateMutex.Lock()
		if idleArm1Active {
			currentStep1 = (currentStep1 + 1) % len(sequence)
		}
		if idleArm2Active {
			currentStep2 = (currentStep2 + 1) % len(sequence)
		}
		stateMutex.Unlock()

		time.Sleep(1 * time.Millisecond)
	}
}

// runs the LED on top of the water tower
func waterTowerLED() {
	for {
		stateMutex.RLock()
		active := idleArm1Active || idleArm2Active
		stateMutex.RUnlock()

		if active {
			waterLED.Out(gpio.High)
			time.Sleep(1 * time.Second)
			waterLED.Out(gpio.Low)
			time.Sleep(1 * time.Second)
			continue
		}

		waterLED.Out(gpio.Low)
		time.Sleep(200 * time.Millisecond)
	}
}

func clearGroupPins(pins []gpio.PinOut) {
	for _, pin := range pins {
		if err := pin.Out(gpio.Low); err != nil {
			fmt.Printf("Failed to clear group pin: %v\n", err)
		}
	}
}

func setGroupPins(pins []gpio.PinOut, pattern [4]bool) {
	for i, pin := range pins {
		if err := pin.Out(gpioLevel(pattern[i])); err != nil {
			fmt.Printf("Failed to update pin %d: %v\n", i, err)
		}
	}
}

func gpioLevel(on bool) gpio.Level {
	if on {
		return gpio.High
	}
	return gpio.Low
}

func clearAll() {
	for _, pin := range append(append([]gpio.PinOut{}, arm1Pins...), arm2Pins...) {
		if err := pin.Out(gpio.Low); err != nil {
			fmt.Printf("Failed to clear pin: %v\n", err)
		}
	}
	if err := waterLED.Out(gpio.Low); err != nil {
		fmt.Printf("Failed to clear water LED: %v\n", err)
	}
}
