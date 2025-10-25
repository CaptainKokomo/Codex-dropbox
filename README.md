# NodeLab

NodeLab is an Electron + React desktop sandbox that lets beginners build circuits by dragging LEGO-like components, wiring them
together, and watching live feedback. It features beginner-first copy, live hints, and a simulation worker that keeps the UI responsive.

## Download & install — no commands, ever

**If you just want to use NodeLab, stop reading after these four steps. There is no `npm`, no PowerShell, no command prompt involved.**

1. Open the `release/` folder that ships with NodeLab (or grab the same files from the official download link).
2. Double-click **`NodeLab-Setup.exe`**. The installer is truly one click and drops a desktop shortcut automatically.
3. Prefer portable? Double-click **`NodeLab.exe`** instead. It runs from any folder without installing.
4. Launch the app from the shortcut (or the portable `.exe`). On first launch NodeLab will ask where to store projects (Desktop, Downloads, or a custom folder).

That’s it. You are done. No terminals, no `npm install`, no extra steps.

---

## For contributors and power users

Everything below is only for people who want to modify the codebase. If you just installed the app, you can safely ignore the rest of this document.

Developer docs live in [`DEVELOPMENT.md`](DEVELOPMENT.md) and walk through the usual `npm` commands, hot reload, and packaging workflow.

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
