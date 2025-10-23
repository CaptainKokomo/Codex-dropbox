import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { ensureIpcChannels } from './ipc';

const isDev = process.env.NODE_ENV === 'development';

const settings = new Store({
  name: 'nodelab-settings',
  defaults: {
    projectFolder: '',
    languageMode: 'simple' as 'simple' | 'detailed',
    showTips: true,
    autoUpdate: true,
    advancedMode: false
  }
});

let mainWindow: BrowserWindow | null = null;

function resolveRendererUrl(): string {
  if (isDev) {
    return 'http://localhost:5173';
  }

  return `file://${path.join(__dirname, '../renderer/index.html')}`;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#10121a' : '#f5f6fa',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev
    }
  });

  const rendererUrl = resolveRendererUrl();
  await mainWindow.loadURL(rendererUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  ensureIpcChannels(ipcMain, settings);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});

ipcMain.handle('app:openExternal', async (_event, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('settings:get', async () => settings.store);

ipcMain.handle('settings:update', async (_event, payload: Partial<Record<string, unknown>>) => {
  settings.set(payload);
  return settings.store;
});
