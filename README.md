# My Own Damn Second Brain

An offline-first, markdown-native knowledge workspace with a tri-pane layout, AI assistant tools, and zero-terminal launch scripts.

## Getting Started

1. Install dependencies once: double-click `launchers/start-my-own-damn-second-brain.sh` (Linux), `launchers/Start My Own Damn Second Brain.command` (macOS), or run `npm install` manually if required.
2. Launch the app with the shortcut created in the `launchers` folder for your platform:
   - **macOS:** double-click `Start My Own Damn Second Brain.command`
   - **Windows:** double-click `Start My Own Damn Second Brain.bat`
   - **Linux:** double-click or run `start-my-own-damn-second-brain.sh`

The script opens the Electron desktop app without needing to run commands in a terminal each time.

## Configure your local AI model

1. Open the app and click **Configure** in the AI pane to edit the local model settings.
2. Point the **Base URL** to your OpenWebUI (or compatible) server. Defaults to `http://127.0.0.1:3000`.
3. Adjust the **Endpoint**, **Model**, **Temperature**, and optional **API key** and press **Save**. The connection status updates instantly.

You can still edit `config/app.config.json` manually if you prefer; the desktop shell watches the file and refreshes the configuration live.

The assistant uses the OpenAI-compatible `/v1/chat/completions` API, so OpenWebUI or any server that mimics that contract will plug in without additional work.

## Keyboard Shortcuts

- **Ctrl/Cmd + N** – Quick capture modal
- **Ctrl/Cmd + K** – Global search
- **Ctrl/Cmd + S** – Save note (handled automatically on blur)
- **Right-click** on spaces/sections/notes for quick actions
- **/** inside the editor – Slash command menu

## Storage

Notes live in the local `storage/` directory using plain Markdown files with YAML frontmatter. You can edit them directly in any external editor if desired.

Snapshots from AI actions are saved in `storage/.snapshots` (latest 20 versions per note).

The quick actions (new space/section/note, rename, delete) now use inline dialogs inside the desktop shell so everything works without relying on browser prompts.

## Development

- `npm install`
- `npm start`

The app watches the storage directory for external changes and refreshes automatically.
