# NodeLab developer guide

> **Heads up:** None of this is required to install or run NodeLab. The end-user installer is already built. Only follow these steps if you are modifying the code.

## Prerequisites

- Node.js 18+
- npm 9+

## Install dependencies

```bash
npm install
```

## Run in development mode

```bash
npm run dev
```

This starts the Electron main process and the Vite renderer with hot reloading.

## Build production installers

```bash
npm run package
```

Artifacts appear in the `release/` directory:

- `NodeLab-Setup.exe` – one-click Windows installer.
- `NodeLab.exe` – portable build.

## Linting

```bash
npm run lint
```

## Tests

```bash
npm test
```

Both linting and tests are optional but recommended before opening a pull request.
