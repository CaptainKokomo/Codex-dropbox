import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import path from 'node:path';
import url from 'node:url';

const isDevelopment = process.env.NODE_ENV === 'development';

const store = new Store<{ firstRunComplete: boolean; projectFolder?: string; autoUpdate: boolean }>({
  name: 'nodelab-config',
  defaults: {
    firstRunComplete: false,
    projectFolder: undefined,
    autoUpdate: true
  }
});

let mainWindow: BrowserWindow | null = null;

const getPreloadPath = () => {
  return path.join(__dirname, 'preload.js');
};

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#111217',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath()
    }
  });

  const projectFolder = store.get('projectFolder');
  if (!store.get('firstRunComplete') || !projectFolder) {
    await promptForProjectFolder();
  }

  if (isDevelopment) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../web/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function promptForProjectFolder() {
  const result = await dialog.showOpenDialog({
    title: 'Choose a folder to store NodeLab projects',
    properties: ['openDirectory', 'createDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const chosenPath = result.filePaths[0];
    store.set('projectFolder', chosenPath);
    store.set('firstRunComplete', true);
    mainWindow?.webContents.send('project-folder-selected', chosenPath);
  }
}

function setupIPC() {
  ipcMain.handle('get-settings', async () => ({
    projectFolder: store.get('projectFolder'),
    autoUpdate: store.get('autoUpdate'),
    darkMode: nativeTheme.shouldUseDarkColors
  }));

  ipcMain.handle('choose-project-folder', async () => {
    await promptForProjectFolder();
    return store.get('projectFolder');
  });

  ipcMain.handle('set-auto-update', (_, value: boolean) => {
    store.set('autoUpdate', value);
  });

  ipcMain.on('request-app-version', (event) => {
    event.sender.send('app-version', app.getVersion());
  });
}

function setupAutoUpdate() {
  if (!store.get('autoUpdate')) {
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdatesAndNotify().catch(() => {
    // Silent failure if offline
  });
}

app.whenReady().then(async () => {
  setupIPC();
  await createWindow();
  setupAutoUpdate();

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
