# NodeLab – Stage 0 (First-Run Wizard)

Stage 0 focuses entirely on the first-run experience. When learners open NodeLab for the very first time, they are guided through a friendly wizard that captures the essentials before revealing the workbench shell.

## What’s Included in Stage 0
- **Welcome screen** that sets expectations in everyday language.
- **Save folder chooser** powered by the native Windows dialog—no command line steps.
- **Auto-update toggle** so offline users stay in control.
- **10-second guided tour** walking through the bench layout (center breadboard, left tray, right inspector, bottom instruments).
- **Local telemetry sandbox** that logs progress for future replay while remaining on-device.

## Running the Stage 0 Build
1. Download the packaged Windows bundle (`NodeLab-Stage0-Windows.zip`) supplied with the release of this build.
2. Double-click either `NodeLab-Setup.exe` (installer) or `NodeLab.exe` (portable). Both are inside the ZIP—no terminals required.
3. Follow the in-app wizard described above. Once complete, the bench shell placeholder appears automatically on future launches.

> ⚠️ The source repository does **not** contain compiled executables. Always use the packaged release bundle that accompanies official drops when you want to run NodeLab without developer tooling.

## Using the Wizard
A step-by-step walkthrough of the entire first-run flow is available in [`docs/stage0-first-run-guide.md`](docs/stage0-first-run-guide.md). Share it with new learners so they know exactly what to expect before touching the workbench.

## What Comes Next
Upcoming stages (not yet in this repository snapshot) will deliver:
- Stage 1: Breadboard bench shell with drag-and-drop parts tray.
- Stage 2: Wiring interactions with highlighting, labels, and context menus.
- Stage 3: Guided “Blink an LED” tutorial engine with achievements.
- Stage 4: Simulation MVP powering the 555 blinker prefab, live meters, and wire glow.

Each stage will build on this onboarding foundation while keeping the installer-first mindset.
