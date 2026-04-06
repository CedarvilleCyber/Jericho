/*
Description:
This api is meant to be run on the pi controlling the matricies onto of the data
center. The api allows calls to be made to enact affects on the matrix

Build command: env GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0 go build -o matrix-api main_ai.go

This version was vibe coded and really only good for seeing how to setup things
*/

import (
	"fmt"
	// "net/http"
	"strconv"
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
	'B': {0x7C, 0x42, 0x42, 0x7C, 0x42, 0x42, 0x7C, 0x00},
	'C': {0x3C, 0x42, 0x40, 0x40, 0x40, 0x42, 0x3C, 0x00},
	'D': {0x78, 0x44, 0x42, 0x42, 0x42, 0x44, 0x78, 0x00},
	'E': {0x7E, 0x40, 0x40, 0x7C, 0x40, 0x40, 0x7E, 0x00},
	'F': {0x7E, 0x40, 0x40, 0x7C, 0x40, 0x40, 0x40, 0x00},
	'G': {0x3C, 0x42, 0x40, 0x4E, 0x42, 0x42, 0x3C, 0x00},
	'H': {0x42, 0x42, 0x42, 0x7E, 0x42, 0x42, 0x42, 0x00},
	'I': {0x3E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x3E, 0x00},
	'J': {0x1E, 0x04, 0x04, 0x04, 0x44, 0x44, 0x38, 0x00},
	'K': {0x42, 0x44, 0x48, 0x70, 0x48, 0x44, 0x42, 0x00},
	'L': {0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x7E, 0x00},
	'M': {0x42, 0x66, 0x5A, 0x5A, 0x42, 0x42, 0x42, 0x00},
	'N': {0x42, 0x62, 0x52, 0x4A, 0x46, 0x42, 0x42, 0x00},
	'O': {0x3C, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00},
	'P': {0x7C, 0x42, 0x42, 0x7C, 0x40, 0x40, 0x40, 0x00},
	'Q': {0x3C, 0x42, 0x42, 0x42, 0x4A, 0x44, 0x3A, 0x00},
	'R': {0x7C, 0x42, 0x42, 0x7C, 0x48, 0x44, 0x42, 0x00},
	'S': {0x3C, 0x42, 0x40, 0x3C, 0x02, 0x42, 0x3C, 0x00},
	'T': {0x7E, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x00},
	'U': {0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00},
	'V': {0x42, 0x42, 0x42, 0x42, 0x42, 0x24, 0x18, 0x00},
	'W': {0x42, 0x42, 0x42, 0x5A, 0x5A, 0x66, 0x42, 0x00},
	'X': {0x42, 0x24, 0x18, 0x18, 0x18, 0x24, 0x42, 0x00},
	'Y': {0x42, 0x24, 0x18, 0x18, 0x10, 0x10, 0x10, 0x00},
	'Z': {0x7E, 0x04, 0x08, 0x10, 0x20, 0x40, 0x7E, 0x00},

	'0': {0x3C, 0x42, 0x46, 0x4A, 0x52, 0x62, 0x3C, 0x00},
	'1': {0x08, 0x18, 0x08, 0x08, 0x08, 0x08, 0x1C, 0x00},
	'2': {0x3C, 0x42, 0x02, 0x0C, 0x30, 0x40, 0x7E, 0x00},
	'3': {0x3C, 0x42, 0x02, 0x1C, 0x02, 0x42, 0x3C, 0x00},
	'4': {0x04, 0x0C, 0x14, 0x24, 0x7E, 0x04, 0x04, 0x00},
	'5': {0x7E, 0x40, 0x7C, 0x02, 0x02, 0x42, 0x3C, 0x00},
	'6': {0x3C, 0x40, 0x7C, 0x42, 0x42, 0x42, 0x3C, 0x00},
	'7': {0x7E, 0x02, 0x04, 0x08, 0x10, 0x10, 0x10, 0x00},
	'8': {0x3C, 0x42, 0x42, 0x3C, 0x42, 0x42, 0x3C, 0x00},
	'9': {0x3C, 0x42, 0x42, 0x3E, 0x02, 0x42, 0x3C, 0x00},

	'!': {0x08, 0x08, 0x08, 0x08, 0x08, 0x00, 0x08, 0x00},
	'?': {0x3C, 0x42, 0x02, 0x0C, 0x10, 0x00, 0x10, 0x00},
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

var currentDisplays [8][8]byte // matrix index -> glyph (8 bytes for 8 rows)

var idleRunning bool = true

var displayMutex sync.Mutex

func init() {
	for i := range currentDisplays {
		currentDisplays[i] = CLEAR
	}
}

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

	// ! Speed may be off, don't understand mode yet, and not sure what the last int is for
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

	// Start display refresh goroutine
	go func() {
		for {
			displayMutex.Lock()
			displays := currentDisplays // copy
			displayMutex.Unlock()
			for matrix := 0; matrix < 8; matrix++ {
				drawGlyph(matrix, displays[matrix], "B")
			}
			time.Sleep(1 * time.Millisecond) // Refresh at ~1000Hz
		}
	}()

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
		c.JSON(200, gin.H{"message": "idle started\n"})
	})

	router.POST("/idle/stop", func(c *gin.Context) {
		idleRunning = false
		displayMutex.Lock()
		for m := 0; m < 8; m++ {
			currentDisplays[m] = CLEAR
		}
		displayMutex.Unlock()
		c.JSON(200, gin.H{"message": "idle stopped\n"})
	})

	router.GET("/test", func(c *gin.Context) {
		matrixIndexStr := c.Query("matrix")
		char := strings.ToUpper(c.Query("char"))
		color := strings.ToUpper(c.DefaultQuery("color", "B"))

		if matrixIndexStr == "" || char == "" {
			c.JSON(400, gin.H{"error": "matrix and char are required\n"})
			return
		}

		matrixIndex, err := strconv.Atoi(matrixIndexStr)
		if err != nil || matrixIndex < 0 || matrixIndex >= len(CS_PINS) {
			c.JSON(400, gin.H{"error": "matrix must be an integer between 0 and 7\n"})
			return
		}

		if len(char) != 1 {
			c.JSON(400, gin.H{"error": "char must be a single character\n"})
			return
		}

		glyph, ok := matrix_font[rune(char[0])]
		if !ok {
			c.JSON(400, gin.H{"error": "unsupported character\n"})
			return
		}

		// Set the display for 10 seconds
		displayMutex.Lock()
		currentDisplays[matrixIndex] = glyph
		displayMutex.Unlock()
		go func() {
			time.Sleep(10 * time.Second)
			displayMutex.Lock()
			currentDisplays[matrixIndex] = CLEAR
			displayMutex.Unlock()
		}()

		c.JSON(200, gin.H{"matrix": matrixIndex, "char": char, "color": color, "duration": "10 seconds\n"})
	})

	router.Run("0.0.0.0:8080")
}

func centerGlyph(glyph [8]byte) [8]byte {
	minCol := 7
	maxCol := 0

	// Find bounding box
	for _, row := range glyph {
		for col := 0; col < 8; col++ {
			if (row>>col)&1 == 1 {
				if col < minCol {
					minCol = col
				}
				if col > maxCol {
					maxCol = col
				}
			}
		}
	}

	width := maxCol - minCol + 1
	offset := (8 - width) / 2

	var centered [8]byte

	for i, row := range glyph {
		trimmed := (row >> minCol) & ((1 << width) - 1)
		centered[i] = trimmed << offset
	}

	return centered
}
func toHexString(glyph [8]byte) string {
	result := ""
	for i, row := range glyph {
		result += fmt.Sprintf("%02x", row)
		if i != 7 {
			result += " "
		}
	}
	return result
}

func buildFontMap() map[rune]string {
	result := make(map[rune]string)

	for char, glyph := range matrix_font {
		centered := centerGlyph(glyph)
		result[char] = toHexString(centered)
	}

	return result
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

	//time.Sleep(40 * time.Microsecond)

	CS_PINS[matrix].Out(gpio.High)
}

func colorMask(pattern byte, enabled bool) byte {
	if enabled {
		return ^pattern & 0xFF
	}
	return 0xFF
}

func drawGlyph(matrix int, glyph [8]byte, color string) {
	for row := 0; row < 8; row++ {
		send_data(matrix, row, glyph[row], color)
	}
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

func buildReversedFontMap(source map[rune][8]byte) map[rune][8]byte {
	result := make(map[rune][8]byte, len(source))
	for char, glyph := range source {
		var reversed [8]byte
		for i, row := range glyph {
			b := row
			b = (b>>4)&0x0F | (b&0x0F)<<4
			b = (b>>2)&0x33 | (b&0x33)<<2
			b = (b>>1)&0x55 | (b&0x55)<<1
			reversed[i] = b
		}
		result[char] = reversed
	}
	return result
}

func idle() {
	text := "JERICHO!"
	glyphs := make([][8]byte, len(text))
	for i, char := range text {
		glyphs[i] = matrix_font[rune(char)]
	}
	for i := 1; i <= len(text); i++ {
		displayMutex.Lock()
		for m := 0; m < i; m++ {
			currentDisplays[m] = glyphs[m]
		}
		for m := i; m < 8; m++ {
			currentDisplays[m] = CLEAR
		}
		displayMutex.Unlock()
		time.Sleep(time.Second)
	}
	displayMutex.Lock()
	for m := 0; m < 8; m++ {
		currentDisplays[m] = CLEAR
	}
	displayMutex.Unlock()
}

// TODO: function for general state

// TODO: function for changing the matrices

// TODO: map to convert characters to matrix layout
