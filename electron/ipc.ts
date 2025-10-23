import { dialog, IpcMain, shell } from 'electron';
import Store from 'electron-store';
import fs from 'fs/promises';
import path from 'path';
import { AppIpcChannels } from '@shared/types/ipc';

export function ensureIpcChannels(ipcMain: IpcMain, settings: Store): void {
  ipcMain.handle(AppIpcChannels.CHOOSE_PROJECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choose project folder',
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return settings.get('projectFolder') as string;
    }

    const projectFolder = result.filePaths[0];
    settings.set('projectFolder', projectFolder);
    return projectFolder;
  });

  ipcMain.handle(AppIpcChannels.SAVE_PROJECT, async (_event, payload) => {
    const projectFolder = (settings.get('projectFolder') as string) || appFallbackFolder();
    await fs.mkdir(projectFolder, { recursive: true });

    const { fileName, data } = payload as { fileName: string; data: string };
    const targetPath = path.join(projectFolder, fileName);
    await fs.writeFile(targetPath, data, 'utf-8');
    return targetPath;
  });

  ipcMain.handle(AppIpcChannels.LOAD_PROJECT, async (_event, filePath: string) => {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  });

  ipcMain.handle(AppIpcChannels.EXPORT_FILE, async (_event, payload) => {
    const { dialogTitle, defaultPath, data, filters } = payload as {
      dialogTitle: string;
      defaultPath: string;
      data: Buffer | string;
      filters?: Electron.FileFilter[];
    };

    const result = await dialog.showSaveDialog({
      title: dialogTitle,
      defaultPath,
      filters
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    await fs.writeFile(result.filePath, data);
    return result.filePath;
  });

  ipcMain.handle(AppIpcChannels.OPEN_LINK, async (_event, url: string) => {
    await shell.openExternal(url);
  });
}

function appFallbackFolder(): string {
  const os = process.platform;
  if (os === 'win32') {
    return path.join(process.env.USERPROFILE ?? '', 'Documents', 'NodeLabProjects');
  }

  return path.join(process.env.HOME ?? '.', 'NodeLabProjects');
}
