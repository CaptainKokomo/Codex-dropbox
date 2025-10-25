# NodeLab

NodeLab is an Electron + React desktop sandbox that lets beginners build circuits by dragging LEGO-like components, wiring them
together, and watching live feedback. It features beginner-first copy, live hints, and a simulation worker that keeps the UI responsive.

## Download & install (no console required)

1. Grab **`NodeLab-Setup.exe`** from the `release/` folder (or your build pipeline artifact).
2. Double-click it. The installer is one-click and drops a desktop shortcut automatically.
3. Prefer portable? Use **`NodeLab.exe`** in the same folder—no installation, just run it from anywhere.
4. On first launch the app asks where to store projects (Desktop, Downloads, or custom).

## Developing locally

```bash
npm install
npm run dev
```

This boots both the Electron shell and the Vite-powered renderer. The renderer is reachable at `http://localhost:5173` and auto-connects to the Electron window.

### Building installers

```bash
npm run package
```

This runs the TypeScript builds, bundles the renderer, mirrors it into `dist/renderer`, and calls `electron-builder` to create both the one-click installer (`release/NodeLab-Setup.exe`) and the portable executable (`release/NodeLab.exe`).

## Key features

- **Beginner UI shell** with top bar controls, component palette, canvas workspace, inspector, diagnostics strip, and tutorial coach.
- **Drag-and-snap canvas** built on Konva with node highlighting, grid snapping, wire previews, and right-click context actions for wire deletion and node editing.
- **State powered by Zustand** across UI, canvas, simulation, projects, tutorials, and plugin registry slices.
- **Web Worker simulation loop** that mimics LED blinking, meter readings, and safety warnings while keeping the main thread at 60 fps.
- **Share link helper** that queues uploads when offline and surfaces copy-ready links.
- **Plugin-ready component catalog** so future component packs can be registered without recompiling the app.

## Folder structure

```
├── src/main          # Electron main + preload processes
├── app               # React renderer with Vite
│   ├── src/components
│   ├── src/state
│   ├── src/simulation
│   ├── src/services
│   ├── src/plugins
│   ├── src/data
│   └── src/tutorials
```

## Accessibility & learning

- Buttons include focus states and ARIA labels.
- Tutorial steps guide new users through building a blinking LED circuit.
- Beginner mode toggles hints, tooltips, and plain-English descriptions.

## Simulation API

Renderer components communicate circuit graphs to a Web Worker (`app/src/simulation/simulationWorker.ts`). The worker exposes a simple API (`run`, `pause`, `reset`, `updateCircuit`) that can be swapped with a more advanced solver or WASM module without changing UI code.

## Sharing & persistence

- Projects save as JSON via secure IPC bridges to the Electron main process.
- Canvas snapshots export as PNG files.
- Share link uploads are abstracted so a future backend (Firebase, Express, etc.) can receive project payloads.

## License

MIT
