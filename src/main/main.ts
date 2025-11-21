import { app, BrowserWindow, dialog, ipcMain, Menu, nativeTheme } from 'electron';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import path from 'path';
import url from 'url';

const isDev = process.env.NODE_ENV === 'development';
const store = new Store<{ projectFolder?: string; autoUpdate?: boolean }>();

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 720,
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true
      });

  await mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  if (!store.get('projectFolder')) {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Choose your NodeLab project folder',
      properties: ['openDirectory', 'createDirectory']
    });
    if (!result.canceled && result.filePaths[0]) {
      store.set('projectFolder', result.filePaths[0]);
    }
  }

  setupMenu();
};

const setupMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Choose Project Folder…',
          click: async () => {
            if (!mainWindow) return;
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Choose project folder',
              properties: ['openDirectory', 'createDirectory']
            });
            if (!result.canceled && result.filePaths[0]) {
              store.set('projectFolder', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' as const }
      ]
    },
    {
      label: 'View',
      submenu: [{ role: 'reload' as const }, { role: 'toggleDevTools' as const }]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

ipcMain.handle('project-folder:get', () => store.get('projectFolder'));
ipcMain.handle('project-folder:set', (_, folder: string) => store.set('projectFolder', folder));
ipcMain.handle('auto-update:get', () => store.get('autoUpdate', true));
ipcMain.handle('auto-update:set', (_, enabled: boolean) => {
  store.set('autoUpdate', enabled);
  if (enabled) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('ready', () => {
  nativeTheme.themeSource = 'dark';
  createWindow();
  if (!isDev && store.get('autoUpdate', true)) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
