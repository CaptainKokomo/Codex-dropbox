# NodeLab Desktop

NodeLab is a drag-and-drop electronics sandbox. Build beginner-friendly circuits, watch them come alive in real time, and learn without touching a command console.

## Install NodeLab (No command line required)

### Option 1 — Recommended Installer
1. Download **`NodeLab-Setup.exe`** from the latest release package.
2. Double-click the file. The installer will guide you through:
   - Choosing the installation folder.
   - Creating the desktop shortcut.
   - Completing setup in a few clicks.
3. Launch **NodeLab** from the desktop shortcut (or Start menu) and you are ready to build circuits.

### Option 2 — Portable App
1. Download **`NodeLab.exe`** from the latest release package.
2. Copy it anywhere you like (Desktop, USB drive, etc.).
3. Double-click **NodeLab.exe** to launch it directly.

> ⚠️ No additional tools, terminals, or package managers are required. Everything runs locally.

### Where is the `.exe` in this repo?

Prebuilt Windows binaries live in the `release/` folder that ships with every downloadable package:

- `release/NodeLab-Setup.exe` — the guided installer that drops a desktop shortcut.
- `release/NodeLab.exe` — the portable build you can copy anywhere and run directly.

If you are working from a source checkout and do not see these two files, it means you have the development tree only. Download the latest release ZIP (it includes the `release/` directory with both executables) or ask the maintainer for the compiled package. No command-line tooling is needed once you have the files; just double-click the one you prefer.

## First Launch
1. On the first run, choose where you want NodeLab to save your projects (Desktop, Downloads, or a custom folder).
2. A quick 10-second tour introduces the interface.
3. The guided “Blink an LED” tutorial starts automatically so you can build your first circuit in under a minute.

## Everyday Use
- The top bar gives you **Run/Pause**, **Reset**, **Save**, and **Settings**.
- Drag components from the left palette onto the snap-grid canvas.
- Right-click wires to remove them, or right-click component nodes to edit their values.
- The bottom multimeter and oscilloscope display live voltage and current measurements.
- Settings let you toggle auto-updates, switch language style, or reset tutorials.

## Updating NodeLab
- Auto-update is enabled by default. When a new version is available, NodeLab will prompt you to restart—no manual steps required.
- Prefer manual control? Disable auto-updates in **Settings → Auto-Update**. You can always download a newer `NodeLab-Setup.exe` or `NodeLab.exe` later and replace the old one.

## Need Help?
- Open the built-in **?** tips on any component for clear guidance.
- Reach out via the support channel included in the release notes if you have questions or feedback.

Enjoy building circuits like LEGO—no command consoles, no installs beyond a simple double-click.
