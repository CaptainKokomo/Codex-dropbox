# My Own Damn Second Brain

An offline-first, markdown-native knowledge workspace with a tri-pane layout, AI assistant tools, and zero-terminal launch scripts.

## Getting Started

1. Install dependencies once: double-click `launchers/start-my-own-damn-second-brain.sh` (Linux), `launchers/Start My Own Damn Second Brain.command` (macOS), or run `npm install` manually if required.
2. Launch the app with the shortcut created in the `launchers` folder for your platform:
   - **macOS:** double-click `Start My Own Damn Second Brain.command`
   - **Windows:** double-click `Start My Own Damn Second Brain.bat`
   - **Linux:** double-click or run `start-my-own-damn-second-brain.sh`

The script opens the Electron desktop app without needing to run commands in a terminal each time.

## Keyboard Shortcuts

- **Ctrl/Cmd + N** – Quick capture modal
- **Ctrl/Cmd + K** – Global search
- **Ctrl/Cmd + S** – Save note (handled automatically on blur)
- **Right-click** on spaces/sections/notes for quick actions
- **/** inside the editor – Slash command menu

## Storage

Notes live in the local `storage/` directory using plain Markdown files with YAML frontmatter. You can edit them directly in any external editor if desired.

Snapshots from AI actions are saved in `storage/.snapshots` (latest 20 versions per note).

## Development

- `npm install`
- `npm start`

The app watches the storage directory for external changes and refreshes automatically.
