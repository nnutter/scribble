# Scribble

A small Wails v3 desktop app for drawing a signature with a touchpad or mouse.

Move the pointer onto the drawing area, **press Space** to put the pen down,
and move to draw. Press Space again to lift the pen. Repeat for as many
strokes as you need. No mouse button is required and no key needs to be held,
so touchpad disable-while-typing does not interrupt drawing. **Undo stroke**
removes the last stroke; **Clear all** starts over. Leaving the drawing area
ends the current stroke and lifts the pen. Switching windows lifts the pen,
so returning cannot accidentally continue drawing.

**Save SVG** opens a native Save dialog. The exported image has a transparent
background and is cropped to the signature with a little padding. SVG scales
without losing sharpness. The checkerboard and instructions are only preview UI
and are never exported. Drawings stay in memory until you clear them or quit.

Keys are captured while the pointer is over the paper; outside it, buttons retain
normal keyboard navigation. Only Space toggles the pen. OS-reserved
shortcuts and hardware keys may be intercepted by the operating system.

## Run

Runtimes are pinned in `.mise.toml`; run `mise install` for Go and Node.
Also install the [Wails v3 platform prerequisites](https://v3.wails.io/getting-started/installation/)
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

```sh
npm test
npm run check
go vet ./...
go build -o bin/scribble .
```

For a manual desktop check, draw two strokes without clicking, toggling Space
down/up between them, then try Undo and Clear. Hold Space: key repeat must not
toggle the pen repeatedly. Switch away while drawing and return: the pen should
be lifted. Save a signature, inspect the SVG in an image editor, and confirm
that the background is transparent. Cancel Save and verify that the signature
is retained.

## Release

Push a semantic version tag to build all six Wails v3 targets
(`darwin`, `linux`, `windows` × `amd64`, `arm64`) and attach the
checksummed binaries to a GitHub Release. Tags with a prerelease
suffix (e.g. `v1.2.3-rc.1`) become prereleases.

```sh
git tag v1.2.3 && git push origin v1.2.3
```
