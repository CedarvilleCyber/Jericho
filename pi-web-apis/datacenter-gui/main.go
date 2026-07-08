package main

import (
	"fmt"
	"image"
	"image/color"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"gioui.org/app"
	"gioui.org/layout"
	"gioui.org/op"
	"gioui.org/op/clip"
	"gioui.org/op/paint"
	"gioui.org/unit"
	"gioui.org/widget"
	"gioui.org/widget/material"
)

type Trigger struct {
	Name   string
	URL    string
	Color  color.NRGBA
	Button widget.Clickable
}

var jerichoBodyBackground = color.NRGBA{R: 20, G: 20, B: 20, A: 255}

func main() {
	go func() {
		w := new(app.Window)
		w.Option(app.Title("Datacenter GUI"))

		if err := display(w); err != nil {
			log.Fatal(err)
		}
		os.Exit(0)

	}()
	app.Main()
}

func display(w *app.Window) error {
	th := material.NewTheme()
	var ops op.Ops
	var triggersBtn, jerichoBtn widget.Clickable
	//var body layout.Dimensions
	useTriggers := false
	var triggers [4]Trigger
	triggers[0] = Trigger{Name: "Nuclear", URL: "http://nuclear.jericho.local/", Color: color.NRGBA{R: 255, A: 255}}
	triggers[1] = Trigger{Name: "Traffic", URL: "http://traffic.jericho.local/", Color: color.NRGBA{G: 255, B: 120, R: 100, A: 255}}
	triggers[2] = Trigger{Name: "Water", URL: "http://water.jericho.local/", Color: color.NRGBA{B: 255, A: 255}}
	triggers[3] = Trigger{Name: "Sound", URL: "http://sound.jericho.local/", Color: color.NRGBA{R: 0, G: 0, B: 0, A: 255}}
	client := http.Client{
		Timeout: 10 * time.Second,
	}
	for {
		switch e := w.Event().(type) {
		case app.DestroyEvent:
			return e.Err
		case app.FrameEvent:
			gtx := app.NewContext(&ops, e)
			if triggersBtn.Clicked(gtx) {
				useTriggers = true
			}
			if jerichoBtn.Clicked(gtx) {
				useTriggers = false
			}

			layout.Flex{Axis: layout.Vertical}.Layout(gtx,
				layout.Rigid(func(gtx layout.Context) layout.Dimensions {
					return header(gtx, th, &triggersBtn, &jerichoBtn)
				}),
				layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
					if useTriggers {
						return triggerDisplay(gtx, th, &triggers, &client)
					}
					return jerichoDisplay(gtx, th)
				}),
			)
			e.Frame(gtx.Ops)
		}
	}
}

func header(gtx layout.Context, th *material.Theme, triggers, jericho *widget.Clickable) layout.Dimensions {
	paint.FillShape(gtx.Ops, jerichoBodyBackground, clip.Rect{Max: gtx.Constraints.Max}.Op())
	margins := layout.Inset{
		Top:    unit.Dp(10),
		Bottom: unit.Dp(10),
		Left:   unit.Dp(10),
		Right:  unit.Dp(10),
	}
	return layout.Flex{Axis: layout.Horizontal}.Layout(gtx,
		layout.Rigid(func(gtx layout.Context) layout.Dimensions {
			return layout.Flex{
				Axis: layout.Horizontal,
			}.Layout(gtx,
				layout.Rigid(func(gtx layout.Context) layout.Dimensions {
					return margins.Layout(gtx, func(gtx layout.Context) layout.Dimensions {
						return material.Button(th, triggers, "Triggers").Layout(gtx)
					})

				}),
				layout.Rigid(func(gtx layout.Context) layout.Dimensions {
					return margins.Layout(gtx, func(gtx layout.Context) layout.Dimensions {
						return material.Button(th, jericho, "Jericho").Layout(gtx)
					})

				}),
			)
		}),
	)
}

func triggerDisplay(gtx layout.Context, th *material.Theme, triggers *[4]Trigger, client *http.Client) layout.Dimensions {
	for i := range triggers {
		if triggers[i].Button.Clicked(gtx) {
			trigger := &triggers[i]
			fmt.Printf("Trigger: %s Clicked\n", trigger.Name)
			go func(t *Trigger) {
				resp, err := client.Get(t.URL + "health")
				if err != nil {
					fmt.Printf("%s error: %v\n", t.Name, err)
					return
				}
				defer func(Body io.ReadCloser) {
					err := Body.Close()
					if err != nil {
						fmt.Printf("%s error: %v\n", t.Name, err)
						return
					}
				}(resp.Body)

				fmt.Printf("%s response: %s\n", t.Name, resp.Status)
			}(trigger)
		}
	}

	return layout.Flex{
		Axis: layout.Vertical,
	}.Layout(gtx,
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			return layout.Flex{Axis: layout.Horizontal}.Layout(gtx,
				layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
					btn := material.Button(th, &triggers[0].Button, triggers[0].Name)
					btn.Background = triggers[0].Color

					return btn.Layout(gtx)
				}),
				layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
					btn := material.Button(th, &triggers[1].Button, triggers[1].Name)
					btn.Background = triggers[1].Color
					return btn.Layout(gtx)
				}),
			)

		}),
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			return layout.Flex{Axis: layout.Horizontal}.Layout(gtx,
				layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
					btn := material.Button(th, &triggers[2].Button, triggers[2].Name)
					btn.Background = triggers[2].Color
					return btn.Layout(gtx)
				}),
				layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
					btn := material.Button(th, &triggers[3].Button, triggers[3].Name)
					btn.Background = triggers[3].Color
					return btn.Layout(gtx)
				}),
			)

		}),
	)

}

func rotatingCoin(w *app.Window) error {
	//th := material.NewTheme()
	var ops op.Ops
	swap := false

	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			swap = !swap

			w.Invalidate()
		}
	}()

	for {
		switch e := w.Event().(type) {
		case app.DestroyEvent:
			return e.Err
		case app.FrameEvent:
			gtx := app.NewContext(&ops, e)

			currentColor := color.NRGBA{A: 255}
			if swap {
				currentColor = color.NRGBA{G: 100, A: 255}
			}

			circle := clip.Ellipse{Min: image.Pt(100, 100), Max: image.Pt(300, 300)}.Push(gtx.Ops)

			paint.Fill(gtx.Ops, currentColor)

			circle.Pop()

			e.Frame(gtx.Ops)
		}

	}
}

func jerichoDisplay(gtx layout.Context, th *material.Theme) layout.Dimensions {
	paint.FillShape(gtx.Ops, jerichoBodyBackground, clip.Rect{Max: gtx.Constraints.Max}.Op())

	return layout.Flex{
		Axis: layout.Vertical,
	}.Layout(gtx,
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			return twoLetterRow("J", "E", gtx, th)
		}),
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			return twoLetterRow("R", "I", gtx, th)
		}),
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			return twoLetterRow("C", "H", gtx, th)
		}),
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			return twoLetterRow("O", "!", gtx, th)
		}),
	)

}

func twoLetterRow(letter1, letter2 string, gtx layout.Context, th *material.Theme) layout.Dimensions {
	return layout.Flex{
		Axis: layout.Horizontal,
	}.Layout(gtx,
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			lbl := material.Label(th, unit.Sp(50), letter1)
			lbl.Color = color.NRGBA{R: 255, G: 255, B: 255, A: 255}

			return layout.Center.Layout(gtx, lbl.Layout)
		}),
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			lbl := material.Label(th, unit.Sp(50), letter2)
			lbl.Color = color.NRGBA{R: 255, G: 255, B: 255, A: 255}

			return layout.Center.Layout(gtx, lbl.Layout)
		}),
	)
}
