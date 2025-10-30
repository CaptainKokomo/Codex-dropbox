# NodeLab – Stage 0 (First-Run Wizard)

Stage 0 focuses entirely on the first-run experience. When learners open NodeLab for the very first time, they are guided through a friendly wizard that captures the essentials before revealing the workbench shell.

## What’s Included in Stage 0
- **Welcome screen** that sets expectations in everyday language.
- **Save folder chooser** powered by the native Windows dialog—no command line steps.
- **Auto-update toggle** so offline users stay in control.
- **10-second guided tour** walking through the bench layout (center breadboard, left tray, right inspector, bottom instruments).
- **Local telemetry sandbox** that logs progress for future replay while remaining on-device.

## Running the Stage 0 Build
1. Download the packaged Windows bundle (`NodeLab-Stage0-Windows.zip`) that accompanies the official release of this source drop.
2. Open the ZIP and double-click either `NodeLab-Setup.exe` (installs with a desktop shortcut) or `NodeLab.exe` (portable, runs in-place). No command prompts or package managers are involved.
3. The executable launches directly into the wizard described above. After you finish, subsequent launches jump straight to the bench placeholder.

> ⚠️ This repository snapshot contains **source code only**. It does not embed the compiled `.exe` files. If you do not yet have the packaged release bundle, there is nothing to install—request the Stage 0 Windows bundle from the release channel before proceeding.

## Using the Wizard
A step-by-step walkthrough of the entire first-run flow is available in [`docs/stage0-first-run-guide.md`](docs/stage0-first-run-guide.md). Share it with new learners so they know exactly what to expect before touching the workbench.

## What Comes Next
Upcoming stages (not yet in this repository snapshot) will deliver:
- Stage 1: Breadboard bench shell with drag-and-drop parts tray.
- Stage 2: Wiring interactions with highlighting, labels, and context menus.
- Stage 3: Guided “Blink an LED” tutorial engine with achievements.
- Stage 4: Simulation MVP powering the 555 blinker prefab, live meters, and wire glow.

Each stage will build on this onboarding foundation while keeping the installer-first mindset.
