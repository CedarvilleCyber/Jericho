package main

import (
	"image/color"
	"log"
	"os"

	"gioui.org/app"
	"gioui.org/op"
	"gioui.org/op/paint"
	"gioui.org/widget/material"
)

func main() {
	go func() {
		w := new(app.Window)
		if err := run(w); err != nil {
			log.Fatal(err)
		}
		os.Exit(0)

	}()
	app.Main()
}

func run(w *app.Window) error {
	th := material.NewTheme()
	var ops op.Ops
	for {
		switch e := w.Event().(type) {
		case app.DestroyEvent:
			return e.Err
		case app.FrameEvent:
			gtx := app.NewContext(&ops, e)
			paint.Fill(gtx.Ops, color.NRGBA{R: 20, G: 20, B: 20, A: 255})
			lbl := material.H1(th, "Hello, World!")
			lbl.Color = color.NRGBA{R: 255, G: 255, B: 255, A: 255}
			lbl.Layout(gtx)
			e.Frame(gtx.Ops)
		}

	}
}
