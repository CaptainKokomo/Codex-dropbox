# NodeLab Build Plan

## 1. Project Bootstrapping & Tooling
- Manually author `package.json` declaring Electron, React, Zustand, TypeScript, ESLint, Prettier, electron-builder.
- Configure ESLint and Prettier without auto-run installers; document optional commands only.
- Add `tsconfig.json` with strict type checking and path aliases for modules.
- Integrate Husky-like hooks through documented instructions (no auto-setup) for future adoption.
- Instrument performance metrics scaffolding (frame timer logging) from day one.

## 2. Electron Shell & App Lifecycle
- Implement `main.ts` managing a single `BrowserWindow`, security defaults, and IPC for settings, files, simulation, and profiling data.
- Provide first-run save-folder dialog and persist choice in JSON config under app data.
- Stub auto-update controls and ensure toggles wire to UI but remain inert until service is provisioned.
- Register global shortcuts (undo/redo, zoom reset) while respecting accessibility requirements.

## 3. Frontend Architecture & Global State
- Compose React application with Zustand slices: `canvas`, `components`, `wires`, `simulation`, `ui`, `tutorial`, and `profiling`.
- Establish context providers for theme, localization, and hotkey handling.
- Layout structure using CSS Grid/Flex with responsive scaling across resolutions.
- Prepare localization hooks, storing text content in centralized dictionaries (English default).

## 4. Canvas Renderer & Interactions
- Implement HTML Canvas scenegraph with retained-mode data model for components, nodes, wires, and annotations.
- Achieve 60 fps render loop with requestAnimationFrame and offscreen caching for static layers.
- Support zoom, pan, grid snapping, component drag/drop, rotation, duplication, delete.
- Highlight component nodes when wires are dragged, include labels (+, −, gate, etc.), and support right-click wire deletion.
- Allow right-click on nodes to edit component values via in-canvas popover editors.
- Add optional orthogonal wire routing mode toggle with manual adjustments.
- Provide frame-time overlay toggle powered by profiling slice.

## 5. Component Palette & Inspector
- Populate Tier One components and prefabs with metadata (default values, icons, plain-language descriptions).
- Use SVG icons with dynamic coloring; preload assets for zero-lag first use.
- Palette supports drag handles, search/filter, and quick tips via “?” toggles.
- Inspector panel displays editable parameters, unit helpers, coaching messages, and value presets.

## 6. Simulation Engine & Worker Interface
- Define pluggable simulation API contract for DC/transient solvers with TypeScript interfaces.
- Implement initial JS-based solver (nodal analysis + basic transient for 555 timer) running in WebWorker.
- Ensure worker posts periodic updates for node voltages, currents, component status, and detected issues.
- Integrate undo/redo safe serialization and detection for shorts, reversed parts, floating nets with coaching feedback.
- Add performance instrumentation: solver duration, message throughput.

## 7. UI Panels & Controls
- Top toolbar: Run/Pause, Reset, Save, Settings, plus indicators for simulation state and FPS overlay.
- Bottom panel: multimeter readouts, dual-channel oscilloscope with probe selection, history capture, and export.
- Settings modal controls language style, “?” tips, project folder, auto-update toggle, profiling overlay, orthogonal routing, and accessibility options.
- Implement keyboard shortcuts and touch/pen gesture support.

## 8. Tutorial & Coaching System
- Build first-run 10-second tour covering layout and controls.
- Create guided tutorial for LED blink project with step tracking and dynamic hints.
- Provide contextual coaching messages triggered by simulation warnings (e.g., reversed LED, missing resistor) in plain English.
- Maintain history stack for undo/redo operations across interactions.

## 9. File Handling & Sharing
- Define JSON schema for project save files, including metadata and simulator settings.
- Implement import/export dialogs via Electron IPC, supporting PNG/SVG capture of canvas (with background image overlay).
- Stub share-link workflow, returning friendly message until backend exists.

## 10. Build & Installer Pipeline
- Configure `electron-builder` for Windows with NSIS installer and portable exe outputs.
- Document manual invocation of build scripts (`npm run build`, `npm run dist`) without auto-running.
- Ensure installer creates desktop shortcut, registers file associations for `.nodelab`, and respects chosen project folder.

## 11. QA, Accessibility, & Performance
- Draft comprehensive QA checklist covering drag interactions, highlighting, wire editing, node value editing, tutorial flow, undo/redo, and simulation feedback.
- Prepare manual test matrix for touch, pen, and keyboard navigation.
- Include accessibility considerations (contrast, focus order, ARIA roles for dialogs) and mention screen-reader compatibility strategy.
- Specify profiling review cadence and thresholds (frame time ≤16ms average, solver update ≤8ms per step).

## 12. Documentation & Developer Experience
- Maintain `/docs` directory for architectural decisions, API contracts, and profiling reports.
- Provide onboarding guide for contributors emphasizing no automatic installs, listing manual commands when needed.
- Outline future enhancements (cloud sync, advanced components, collaborative editing) for roadmap continuity.
