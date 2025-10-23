# NodeLab

NodeLab is a tactile electronics sandbox built with Electron and React. It combines a snap-grid canvas, live simulation feedback, and plain-English coaching so beginners can assemble their first blinking LED circuit in under a minute.

## Project structure

```
.
├── electron            # Electron main process + preload
├── renderer            # React renderer (Vite-powered)
│   ├── src
│   │   ├── components  # UI components and panels
│   │   ├── data        # Component catalog, kits, missions, tutorials
│   │   ├── hooks       # Simulation + gamified tutorial hooks
│   │   ├── state       # Zustand store and types
│   │   ├── utils       # Simulation + diagnostics helpers
│   │   └── styles      # Global styling tokens
├── shared              # Shared types between main + renderer
├── docs                # Architecture notes and reviews
└── electron-builder.json5
```

## Getting started

> **Prerequisites:** Node.js 18+ and npm 9+.

Install dependencies:

```bash
npm install
```

Start the development environment (launches Vite and Electron in parallel):

```bash
npm run dev
```

Build renderer and main bundles:

```bash
npm run build
```

Create distributables (`NodeLab-Setup.exe` installer + portable build):

```bash
npm run dist
```

## Key features in this iteration

- **Snap-grid canvas with drag-to-wire interactions.** Components highlight their labeled terminals (+, −, OUT, etc.) and wires glow when selected.
- **Component customization through the inspector.** Adjust values with sliders (resistor, LED, battery, etc.), rotate parts in advanced mode, and mark custom tweaks.
- **Gamified questline.** Quest tracker guides learners through the Blink Party mission, awarding rewards without “micro lesson” jargon.
- **Friendly diagnostics.** Real-time hints explain missing power, absent resistors, and possible shorts in plain English.
- **Instrumentation strip.** Multimeter, oscilloscope frequency readout, and coaching feed provide live feedback.
- **Settings modal.** Toggle language tone, tips, auto-update, advanced sandbox, and choose the default project folder.
- **Kits & prefabs.** Palette lists component kits for planning and prefab circuits for instant blinking fun.

## Architecture notes

- **State management:** Zustand with immer middleware powers global state. Selectors expose the active project and selection.
- **Simulation stub:** `renderer/src/utils/simulation.ts` currently estimates voltages/currents and diagnostics; it is ready to be swapped with a physics-accurate solver.
- **IPC bridge:** `electron/preload.ts` exposes safe APIs for file dialogs, settings persistence (via `electron-store`), and exports.
- **Packaging:** `electron-builder.json5` creates both NSIS installer (`NodeLab-Setup.exe`) and portable (`NodeLab.exe`) artifacts.

For deeper design commentary and follow-up suggestions, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/REVIEW.md`](docs/REVIEW.md).
