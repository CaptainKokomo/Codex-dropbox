# NodeLab Desktop

NodeLab is a drag-and-drop electronics sandbox that runs as an Electron + React desktop application. Users can drop beginner-friendly components onto a smooth canvas, wire them up, and see live coaching feedback and simulated readings without touching code or jargon.

## One-Click Installation

- **Installer:** Double-click `NodeLab-Setup.exe` and let the wizard finish. No terminal, no extra tools.
- **Portable:** Prefer to skip installing? Double-click `NodeLab.exe` from the portable zip.
- **First launch:** The app immediately asks where to keep your projects (Desktop, Downloads, or any folder you choose).

Both binaries live in the `dist/` folder generated for releases (right next to `BuildNodeLabInstaller.bat`) and can be shipped directly to users.

## Features

- **Zero-jargon UI** – plain-English component descriptions, tips, and tutorials.
- **Scenegraph canvas** – buttery 60 fps canvas with snapping grid, zoom, pan, and glowing connection nodes.
- **Wire interactions** – drag wires directly from component nodes, see live highlights, and right-click to edit or delete.
- **Component inspector** – right-click component values to edit them, rotate parts, and view pin labels.
- **Simulation bridge** – background worker stub that streams live readings and safety warnings.
- **Onboarding** – first-run tutorial teaches how to blink an LED in under a minute.
- **Windows packaging** – ready-to-build NSIS installer plus portable `.exe`.

## Project Structure

```
├── electron            # Main & preload processes
├── src
│   ├── assets          # UI assets (icons, etc.)
│   ├── canvas          # Canvas renderer & interactions
│   ├── components      # React UI components
│   ├── state           # Zustand store and circuit models
│   ├── styles          # Global and panel-specific styles
│   ├── utils           # Geometry helpers
│   └── workers         # Simulation worker
├── dist                # Build output (generated)
└── electron-builder.yml
```

## Maintainer Setup (no manual CLI required)

If you need to produce fresh binaries, just double-click `BuildNodeLabInstaller.bat` from Windows Explorer. The script:

- Downloads a portable Node.js runtime into `tools/` if it is not already present.
- Installs the exact dependencies declared in `package.json` with zero prompts (it refreshes them on every run to stay in sync).
- Runs `electron-builder` to emit `NodeLab-Setup.exe` and `NodeLab.exe` into the `dist/` folder.
- Saves a detailed transcript at `logs/BuildNodeLabInstaller.log` and keeps the window open so you can review the status.

No terminals, `npm install` commands, or prior Node.js installation are required.

Developers who prefer a live dev environment can still opt-in manually:

```bash
npm install
npm run dev
```

## Packaging

When you are ready to ship a build, double-click `BuildNodeLabInstaller.bat`. The script handles compilation and packaging in one shot, outputs both binaries to the `dist/` directory beside the script, and records the run to `logs/BuildNodeLabInstaller.log` for troubleshooting. Installer settings prompt users for their save folder on first launch and create a desktop shortcut.

## Testing & QA

Manual QA scenarios are tracked inside the `/src/state/store.ts` history stack and include:

- Drag components from the palette onto the canvas (or double-click to drop).
- Drag wires between nodes, hover to highlight targets, and right-click to delete wires.
- Right-click a node to jump to inspector editing state.
- Toggle beginner-friendly settings and verify they persist via Electron store.
- Run the tutorial overlay and confirm completion resets tips.

Automated lint/type check commands are configured but optional:

```bash
npm run lint
npm run typecheck
```

## License

MIT
