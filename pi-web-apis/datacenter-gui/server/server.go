package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DisplayRequest is the JSON body expected by the /api/display endpoint
type DisplayRequest struct {
	Text      string `json:"text"`
	Animation string `json:"animation"` // "fade", "slide", "zoom"
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

func Start(w Frontend) {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	router.POST("/display", func(c *gin.Context) {
		var payload DisplayRequest
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		if payload.Text == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "text field is required"})
			return
		}

		if !validAnimations[payload.Animation] {
			payload.Animation = "fade"
		}

		w.Dispatch(func() {
			w.Eval(fmt.Sprintf(`showText(%q, %q)`, payload.Text, payload.Animation))
		})

		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "display updated"})

	})

	err := router.Run("0.0.0.0:8000")
	if err != nil {
		log.Fatal("API server failed:", err)
	}
}
