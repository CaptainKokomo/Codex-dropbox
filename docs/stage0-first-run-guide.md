# NodeLab Stage 0 – First-Run Wizard Walkthrough

This guide explains exactly what you will see after installing the Stage 0 build of NodeLab and how to progress through the onboarding flow. No command prompt or developer tools are required at any point.

## 1. Launching NodeLab

1. Download the packaged Windows build of NodeLab Stage 0 (`NodeLab-Stage0-Windows.zip`) from the release channel that accompanies this source drop.
2. Inside the ZIP you will find two ready-to-run options:
   - `NodeLab-Setup.exe` – runs an installer that places NodeLab in `C:\Program Files\NodeLab` and adds a desktop shortcut.
   - `NodeLab.exe` – a portable edition you can keep on any drive without installing.
3. Double-click either executable. The installer finishes with a **Launch NodeLab** button; the portable build opens immediately.

> **Important:** This repository contains the source only. Until you receive the release ZIP, there is no executable to run.

## 2. Welcome Screen

- On first launch, NodeLab opens to a warm welcome panel that sets expectations for the onboarding journey.
- Click **Let’s get started** to continue. This button is the only way forward; there is no command line fallback.

## 3. Choose Your Save Folder

- A native Windows folder picker appears. Select the place you want NodeLab to store projects (Desktop, Documents, or any custom folder).
- Confirm the selection. The path is remembered automatically—no manual configuration files required.
- If Windows refuses the folder (e.g., read-only drive), NodeLab shows a friendly message and lets you pick again.

## 4. Auto-Update Preference

- The next panel lets you decide whether NodeLab should auto-update itself when future offline patches are available.
- Use the **Turn off auto-update** / **Keep auto-update on** button to flip the setting. Your choice is saved immediately and becomes the default behavior for this machine.

## 5. Quick Orientation Tour

- After the preferences are locked in, NodeLab starts a 10-second overlay tour that highlights the bench layout:
  1. **Bench Center:** explains the breadboard canvas placeholder you will use in upcoming stages.
  2. **Left Tray:** previews the components palette that will arrive in Stage 1.
  3. **Right Inspector:** points to the area reserved for component details.
  4. **Bottom Instruments:** introduces where the multimeter and oscilloscope will live.
- Each highlight advances automatically every few seconds until the tour completes. Let it finish or close the app once you have seen enough.

## 6. Reaching the Bench Shell

- Once the tour ends, NodeLab reveals the bench shell placeholder. From here you can explore settings or close the app.
- The wizard will not appear again unless you explicitly reset it.

## 7. Resetting the Wizard (Optional)

- Inside the bench shell you will find a **Reset First-Run Wizard** button.
- Clicking it clears the onboarding state so the next launch shows the welcome flow again—useful for onboarding new learners on the same computer.

## 8. Where Your Choices Are Stored

- NodeLab keeps your save-folder path, auto-update preference, and tour completion flag in local encrypted storage.
- Nothing is uploaded or synced; telemetry logs stay on the device for future replay features only.

## 9. Troubleshooting

- If the app closes unexpectedly during the wizard, just launch it again—the wizard resumes from the last unfinished step.
- Should the folder picker fail to open, verify that Windows Explorer is functioning normally, then relaunch NodeLab.
- For any other issues, use the in-app **Help** link (coming in later stages) or contact support with the telemetry snapshot located in ``%AppData%\NodeLab\telemetry``.

With these steps you can comfortably start Stage 0 of NodeLab without touching a console or developer tool.
