# Post-implementation review

This pass captures improvements spotted while wiring up the initial NodeLab shell.

## Immediate opportunities

1. **Simulation accuracy.** `renderer/src/utils/simulation.ts` still uses heuristic values. Swapping in a nodal analysis solver (e.g., modified nodal analysis with sparse matrices) will unlock meaningful multimeter/scope readings and advanced missions.
2. **Undo/redo stack.** The canvas currently supports placement and wiring, but lacks the global undo requested in the spec. A command history layer wrapping `useNodeLabStore` actions would address this.
3. **Wire routing.** Wires render as straight lines between terminals. Introducing orthogonal routing with draggable waypoints will better mimic real breadboard wiring.
4. **Persisted projects.** The store defaults to in-memory projects. Persisting on save/load via IPC should be wired into the UI (Save button in `TopBar`).
5. **Gamified mission UX.** Completed missions immediately advance; adding confetti/badges and a mission selection drawer would reinforce the “game” feel without jargon.
6. **Kits planner.** Kits currently link externally. Embedding a “Plan kit” modal that exports a BOM/blueprint JSON would align with the real-project planning goal.

## Near-term roadmap items

- Implement prefab auto-wiring recipes so dropping a prefab spawns its child components + wires automatically.
- Integrate blueprint export to PCBWay by mapping `CircuitProject.blueprint` into manufacturer-ready JSON/Gerber stubs.
- Add component customization presets so users can save modified parts into their personal library.
- Prepare data contracts for the future 3D workspace (e.g., layer to store breadboard hole coordinates).
- Expand accessibility support (keyboard wire routing, screen reader announcements for voltages).
