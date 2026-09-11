# Scribble

A small Wails v3 desktop app for drawing a signature with a touchpad or mouse.

Move the pointer onto the drawing area, **hold any keyboard key**, and move to draw.
Release all held keys to lift the pen. Repeat for as many strokes as you need.
No mouse button is required. **Undo stroke** removes the last stroke; **Clear all**
starts over. Leaving the drawing area ends the current stroke. Switching windows
resets held keys, so returning cannot accidentally continue drawing.

**Save SVG** opens a native Save dialog. The exported image has a transparent
background and is cropped to the signature with a little padding. SVG scales
without losing sharpness. The checkerboard and instructions are only preview UI
and are never exported. Drawings stay in memory until you clear them or quit.

Keys are captured while the pointer is over the paper; outside it, buttons retain
normal keyboard navigation. Space or Shift is a comfortable choice. OS-reserved
shortcuts and hardware keys may be intercepted by the operating system.

## Run

Requires Go 1.27.1+ and the [Wails v3 platform prerequisites](https://v3.wails.io/getting-started/installation/)
(on macOS, Xcode Command Line Tools). Wails is pinned in `go.mod`.

```sh
go run .
```

The plain HTML, CSS, and JavaScript frontend is embedded into the executable;
there is no Node dependency or frontend build step.

```sh
go build -o bin/scribble .
./bin/scribble
```

## Check

Node 22+ is needed only for the frontend tests.

```sh
node --test tests/*.test.mjs
go vet ./...
go build -o bin/scribble .
```

For a manual desktop check, draw two strokes without clicking, release and move
between them, then try Undo and Clear. Hold two keys and release one: the pen
should stay down until the second is released. Switch away while drawing and
return: the pen should be lifted. Save a signature, inspect the SVG in an image
editor, and confirm that the background is transparent. Cancel Save and verify
that the signature is retained.
