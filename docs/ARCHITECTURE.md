# NodeLab Architecture Overview

This document captures the initial architectural layout for NodeLab and highlights how the codebase maps back to the product goals (friendly onboarding, fast feedback, modular feature packs).

## High-level diagram

```
┌──────────────────────────────┐
│ Electron Main Process        │
│  • electron/main.ts          │
│  • electron/ipc.ts           │
│  • electron/preload.ts       │
│                              │
│  - Window lifecycle          │
│  - Settings persistence      │
│  - File system export/import │
└───────────────┬──────────────┘
                │ IPC bridge (context isolated)
┌───────────────▼──────────────────────────────────────────────────────────┐
│ React Renderer (Vite)                                                   │
│                                                                          │
│  State: Zustand + immer (renderer/src/state)                             │
│   • store.ts – circuits, selection, tutorial progress                    │
│   • types.ts – shared domain models                                      │
│                                                                          │
│  Data packs (renderer/src/data)                                         │
│   • componentLibrary.ts – tier-one components + prefabs                  │
│   • missions.ts – quest definitions                                      │
│   • kits.ts – starter kits / planning bundles                            │
│   • tutorials.ts – guided blink walk-through                             │
│                                                                          │
│  UI shell (renderer/src/components)                                      │
│   • TopBar.tsx – run/pause/reset/settings                                │
│   • ComponentPalette.tsx – drag/drop palette + kits                      │
│   • CanvasWorkspace.tsx – snap grid + wiring interactions                │
│   • InspectorPanel.tsx – component customization                         │
│   • InstrumentationStrip.tsx – multimeter & scope feedback               │
│   • GamifiedCoach.tsx – quest tracker overlay                            │
│   • SettingsModal.tsx – toggles, folder picker, advanced mode            │
│                                                                          │
│  Hooks & utilities                                                       │
│   • useSimulation.ts – orchestrates real-time solver stubs               │
│   • useGamifiedTutorial.ts – mission progression engine                  │
│   • simulation.ts – placeholder solver, diagnostics integration          │
│   • diagnostics.ts – plain-English hints                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

## Key design decisions

1. **Electron + React separation.** The renderer is bundled via Vite for quick iteration, while the Electron main process is compiled with `tsc`. IPC is centralized inside `electron/ipc.ts` to make future API hardening trivial.
2. **State-first circuit modelling.** A single Zustand store holds projects, wires, selection, and gamified progress. This ensures that tutorials, diagnostics, and the inspector react to the same source of truth.
3. **Data-driven onboarding.** Components, missions, tutorials, and kits are all declared as data modules. Adding a new prefab or quest is an append-only change—no rewiring of UI logic required.
4. **Pluggable simulation engine.** The current solver (`runRealtimeSimulation`) supplies deterministic placeholder voltages/ currents and integrates diagnostics. Once a SPICE-like solver is ready, it can replace this module without touching the UI.
5. **Beginner-first UI tokens.** Global CSS tokens define the neon-on-dark look, consistent with the “friendly lab” theme. Animations are kept micro to maintain responsiveness.
6. **Future 3D readiness.** Component interfaces already expose `position` and `rotation`. This allows swapping the 2D canvas for a 3D breadboard scene later without breaking data contracts.

## IPC channels

| Channel | Purpose |
| --- | --- |
| `app:chooseProjectFolder` | Prompts for a default save location and persists it. |
| `app:saveProject` | Saves project JSON into the chosen folder. |
| `app:loadProject` | Reads an existing project file. |
| `app:exportFile` | Writes PNG/SVG/blueprint exports. |
| `app:openLink` | Safely opens external documentation URLs. |

## Build pipeline

1. `npm run dev` – launches Vite dev server on port 5173 and waits before spawning Electron.
2. `npm run build:renderer` – Vite builds into `dist/renderer`.
3. `npm run build:main` – `tsc` compiles Electron sources into `dist/main`.
4. `npm run dist` – runs both builds and packages with `electron-builder` (NSIS + portable).

## Next steps

- Replace the simulation stub with a lightweight SPICE variant and stream node data to the scope component.
- Expand mission data to unlock “Advanced sandbox” quests (higher voltages, AC analysis) once the toggle is enabled.
- Introduce asset loading for future 3D components (GLTF models) while keeping current data schema intact.
