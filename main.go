package main

import (
	"embed"
	"fmt"
	"log"
	"os"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend
var assets embed.FS

type SignatureService struct {
	app    *application.App
	window *application.WebviewWindow
}

// SaveSVG asks for a destination each time; cancelling leaves the drawing intact.
func (s *SignatureService) SaveSVG(svg string) (bool, error) {
	path, err := s.app.Dialog.SaveFile().
		SetMessage("Save your transparent signature").SetFilename("signature.svg").
		AddFilter("SVG image", "*.svg").AttachToWindow(s.window).
		PromptForSingleSelection()
	if err != nil || path == "" {
		return false, err
	}
	if err := os.WriteFile(path, []byte(svg), 0600); err != nil {
		return false, fmt.Errorf("save signature: %w", err)
	}
	return true, nil
}

func main() {
	service := &SignatureService{}
	app := application.New(application.Options{
		Name:        "Scribble",
		Description: "A simple signature maker",
		Services:    []application.Service{application.NewService(service)},
		Assets:      application.AssetOptions{Handler: application.BundledAssetFileServer(assets)},
		Mac:         application.MacOptions{ApplicationShouldTerminateAfterLastWindowClosed: true},
	})
	service.app = app
	service.window = app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: "Scribble", Width: 720, Height: 470, MinWidth: 640, MinHeight: 440, URL: "/",
	})
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
