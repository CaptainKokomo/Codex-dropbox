import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';

const isDev = process.env.NODE_ENV === 'development';
const store = new Store<{ projectDirectory?: string }>({ name: 'nodelab-preferences' });

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 720,
    backgroundColor: '#121417',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    title: 'NodeLab',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' }).catch(() => undefined);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('preferences:get', () => {
  return store.store;
});

ipcMain.handle('preferences:setProjectDir', async (_event, suggestedPath?: string) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
    title: 'Choose project folder',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: suggestedPath ?? store.get('projectDirectory'),
  });
  if (!canceled && filePaths[0]) {
    store.set('projectDirectory', filePaths[0]);
  }
  return store.get('projectDirectory');
});

ipcMain.handle('file:saveProject', async (_event, filename: string, data: string) => {
  const projectDirectory = store.get('projectDirectory');
  if (!projectDirectory) {
    throw new Error('No project directory configured');
  }
  const fullPath = path.join(projectDirectory, `${filename}.json`);
  await fs.promises.writeFile(fullPath, data, 'utf-8');
  return fullPath;
});

ipcMain.handle('file:exportImage', async (_event, filename: string, dataUrl: string) => {
  const projectDirectory = store.get('projectDirectory');
  if (!projectDirectory) {
    throw new Error('No project directory configured');
  }
  const base64 = dataUrl.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');
  const fullPath = path.join(projectDirectory, `${filename}.png`);
  await fs.promises.writeFile(fullPath, buffer);
  shell.showItemInFolder(fullPath);
  return fullPath;
});
