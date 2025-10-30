import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { join } from 'node:path';
import { format } from 'node:url';
import { appendTelemetry, getPreferences, updatePreferences } from './preferences.js';
import type { TelemetryEvent, UserPreferences } from '../shared/preferences.js';

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    show: false,
    webPreferences: {
      preload: join(app.getAppPath(), 'dist/preload/index.js'),
    },
    backgroundColor: '#1b1b1f',
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:8000/index.html');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.removeMenu();
    await mainWindow.loadURL(
      format({
        pathname: join(app.getAppPath(), 'dist/index.html'),
        protocol: 'file',
        slashes: true,
      }),
    );
  }
}

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('preferences:get', async () => {
  return getPreferences();
});

ipcMain.handle('preferences:update', async (_event, update: Partial<UserPreferences>) => {
  const next = updatePreferences(update);
  return next;
});

ipcMain.handle('preferences:choose-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle('telemetry:record', async (_event, payload: TelemetryEvent) => {
  appendTelemetry(payload);
  return true;
});
