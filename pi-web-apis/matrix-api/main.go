/*
Description:
This api is meant to be run on the pi controlling the matricies onto of the data
center. The api allows calls to be made to enact affects on the matrix
*/
package main

import (
	"fmt"
	// "net/http"
	//"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"periph.io/x/conn/v3/gpio"
	"periph.io/x/conn/v3/physic"
	"periph.io/x/conn/v3/spi"
	"periph.io/x/conn/v3/spi/spireg"
	"periph.io/x/host/v3"
	"periph.io/x/host/v3/rpi"
)

// map to get bytes for a letter easily
var matrix_font = map[rune][8]byte{
	'A': {0x18, 0x24, 0x42, 0x7E, 0x42, 0x42, 0x42, 0x00},
	'B': {0x3E, 0x42, 0x42, 0x3E, 0x42, 0x42, 0x3E, 0x00},
	'C': {0x3C, 0x42, 0x02, 0x02, 0x02, 0x42, 0x3C, 0x00},
	'D': {0x1E, 0x22, 0x42, 0x42, 0x42, 0x22, 0x1E, 0x00},
	'E': {0x7E, 0x02, 0x02, 0x3E, 0x02, 0x02, 0x7E, 0x00},
	'F': {0x7E, 0x02, 0x02, 0x3E, 0x02, 0x02, 0x02, 0x00},
	'G': {0x3C, 0x42, 0x02, 0x72, 0x42, 0x42, 0x3C, 0x00},
	'H': {0x42, 0x42, 0x42, 0x7E, 0x42, 0x42, 0x42, 0x00},
	'I': {0x7C, 0x10, 0x10, 0x10, 0x10, 0x10, 0x7C, 0x00},
	'J': {0x78, 0x20, 0x20, 0x20, 0x22, 0x22, 0x1C, 0x00},
	'K': {0x42, 0x22, 0x12, 0x0E, 0x12, 0x22, 0x42, 0x00},
	'L': {0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x7E, 0x00},
	'M': {0x42, 0x66, 0x5A, 0x5A, 0x42, 0x42, 0x42, 0x00},
	'N': {0x42, 0x46, 0x4A, 0x52, 0x62, 0x42, 0x42, 0x00},
	'O': {0x3C, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00},
	'P': {0x3E, 0x42, 0x42, 0x3E, 0x02, 0x02, 0x02, 0x00},
	'Q': {0x3C, 0x42, 0x42, 0x42, 0x52, 0x22, 0x5C, 0x00},
	'R': {0x3E, 0x42, 0x42, 0x3E, 0x12, 0x22, 0x42, 0x00},
	'S': {0x3C, 0x42, 0x02, 0x3C, 0x40, 0x42, 0x3C, 0x00},
	'T': {0x7E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x00},
	'U': {0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00},
	'V': {0x42, 0x42, 0x42, 0x42, 0x42, 0x24, 0x18, 0x00},
	'W': {0x42, 0x42, 0x42, 0x5A, 0x5A, 0x66, 0x42, 0x00},
	'X': {0x42, 0x24, 0x18, 0x18, 0x18, 0x24, 0x42, 0x00},
	'Y': {0x42, 0x24, 0x18, 0x18, 0x08, 0x08, 0x08, 0x00},
	'Z': {0x7E, 0x20, 0x10, 0x08, 0x04, 0x02, 0x7E, 0x00},

	'0': {0x3C, 0x42, 0x62, 0x52, 0x4A, 0x46, 0x3C, 0x00},
	'1': {0x10, 0x18, 0x10, 0x10, 0x10, 0x10, 0x38, 0x00},
	'2': {0x3C, 0x42, 0x40, 0x30, 0x0C, 0x02, 0x7E, 0x00},
	'3': {0x3C, 0x42, 0x40, 0x38, 0x40, 0x42, 0x3C, 0x00},
	'4': {0x20, 0x30, 0x28, 0x24, 0x7E, 0x20, 0x20, 0x00},
	'5': {0x7E, 0x02, 0x3E, 0x40, 0x40, 0x42, 0x3C, 0x00},
	'6': {0x3C, 0x02, 0x3E, 0x42, 0x42, 0x42, 0x3C, 0x00},
	'7': {0x7E, 0x40, 0x20, 0x10, 0x08, 0x08, 0x08, 0x00},
	'8': {0x3C, 0x42, 0x42, 0x3C, 0x42, 0x42, 0x3C, 0x00},
	'9': {0x3C, 0x42, 0x42, 0x7C, 0x40, 0x42, 0x3C, 0x00},

	'!': {0x10, 0x10, 0x10, 0x10, 0x10, 0x00, 0x10, 0x00},
	'?': {0x3C, 0x42, 0x40, 0x30, 0x08, 0x00, 0x08, 0x00},
}

var CS_PINS = []gpio.PinOut{
	rpi.P1_29, // GPIO05
	rpi.P1_31, // GPIO6
	rpi.P1_33, // GPIO13
	rpi.P1_35, // GPIO19
	rpi.P1_37, // GPIO26
	rpi.P1_32, // GPIO12
	rpi.P1_36, // GPIO16
	rpi.P1_40, // GPIO21
}

var CLEAR = [8]byte{0, 0, 0, 0, 0, 0, 0, 0}

var spiConn spi.Conn
var spiMutex sync.Mutex

var idleRunning bool = true

func main() {
	// Initialize periph.io host (required for hardware access)
	if _, err := host.Init(); err != nil {
		fmt.Printf("Failed to initialize host: %v\n", err)
		return
	}

	var err error

	p, err := spireg.Open("")
	if err != nil {
		fmt.Printf("Failed to register spi: %v\n", err)
		return
	}
	defer p.Close()

	spiConn, err = p.Connect(10*physic.MegaHertz, spi.Mode0, 8)
	if err != nil {
		fmt.Printf("Failed to open SPI: %v\n", err)
		return
	}

	// Initialize GPIO pins as outputs and set high (matches Python's GPIO setup)
	for _, pin := range CS_PINS {
		if err := pin.Out(gpio.High); err != nil {
			fmt.Printf("Failed to set GPIO pin: %v\n", err)
			return
		}
	}

	// Start idle loop in goroutine
	go func() {
		for {
			if idleRunning {
				idle()
			} else {
				time.Sleep(time.Second)
			}
		}
	}()

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	router.POST("/idle/start", func(c *gin.Context) {
		idleRunning = true
		c.JSON(200, gin.H{"message": "idle started"})
	})

	router.POST("/idle/stop", func(c *gin.Context) {
		idleRunning = false
		clearAll()
		c.JSON(200, gin.H{"message": "idle stopped"})
	})

	router.POST("/flash", func(c *gin.Context) {
		text := strings.ToUpper(c.Query("text"))
		color := strings.ToUpper(c.DefaultQuery("color", "B"))

		if text == "" {
			c.JSON(400, gin.H{"error": "must include text to display"})
			return
		}

		if len(text) > 8 {
			c.JSON(400, gin.H{"error": "text can't be more than 8 characters"})
			return
		}

		go func() {
			flash_string(text, color)
		}()
		c.JSON(200, gin.H{"text": text, "color": color, "duration": "10 seconds"})
	})

	router.Run("0.0.0.0:8000")
}

func send_data(matrix, row int, pattern byte, color string) {
	spiMutex.Lock()
	defer spiMutex.Unlock()

	// Pull CE low
	CS_PINS[matrix].Out(gpio.Low)

	red := colorMask(pattern, strings.Contains(color, "R"))
	blue := colorMask(pattern, strings.Contains(color, "B"))
	green := colorMask(pattern, strings.Contains(color, "G"))

	data := []byte{
		red,
		blue,
		green,
		byte(1 << row),
	}

	if err := spiConn.Tx(data, nil); err != nil {
		fmt.Printf("SPI transmit error: %v\n", err)
		return
	}

	CS_PINS[matrix].Out(gpio.High)
}

func colorMask(pattern byte, enabled bool) byte {
	if enabled {
		return ^pattern & 0xFF
	}
	return 0xFF
}

func clearMatrix(matrix int) {
	for row := 0; row < 8; row++ {
		send_data(matrix, row, CLEAR[row], "")
	}
}

func clearAll() {
	for matrix := 0; matrix < 8; matrix++ {
		clearMatrix(matrix)
	}
}

// flash a 8 character string on matrix board for 10 seconds
func flash_string(text, color string) {
	display := make([][8]byte, len(text))
	for i, char := range text {
		display[i] = matrix_font[rune(char)]
	}
	start := time.Now()
	for time.Since(start) < time.Second*10 {
		matrixOn := time.Now()
		for time.Since(matrixOn) < time.Second {
			for row := 0; row < 8; row++ {
				send_data(0, row, display[0][row], color)
				if len(text) > 1 {
					send_data(1, row, display[1][row], color)
				}
				if len(text) > 2 {
					send_data(2, row, display[2][row], color)
				}
				if len(text) > 3 {
					send_data(3, row, display[3][row], color)
				}
				if len(text) > 4 {
					send_data(4, row, display[4][row], color)
				}
				if len(text) > 5 {
					send_data(5, row, display[5][row], color)
				}
				if len(text) > 6 {
					send_data(6, row, display[6][row], color)
				}
				if len(text) > 7 {
					send_data(7, row, display[7][row], color)
				}
			}
		}
		clearAll()
		time.Sleep(time.Second / 2)
	}
}

func idle() {
	text := "JERICHO!"
	display := make([][8]byte, len(text))
	for i, char := range text {
		display[i] = matrix_font[rune(char)]
	}
	for i := 0; i < len(text); i++ {
		start := time.Now()
		for time.Since(start) < time.Second {
			for row := 0; row < 8; row++ {
				send_data(0, row, display[0][row], "B")
				if i >= 1 {
					send_data(1, row, display[1][row], "B")
				}
				if i >= 2 {
					send_data(2, row, display[2][row], "B")
				}
				if i >= 3 {
					send_data(3, row, display[3][row], "B")
				}
				if i >= 4 {
					send_data(4, row, display[4][row], "B")
				}
				if i >= 5 {
					send_data(5, row, display[5][row], "B")
				}
				if i >= 6 {
					send_data(6, row, display[6][row], "B")
				}
				if i >= 7 {
					send_data(7, row, display[7][row], "B")
				}
			}
		}
	}
	clearAll()

}
