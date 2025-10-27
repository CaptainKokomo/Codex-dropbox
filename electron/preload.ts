import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: async () => ipcRenderer.invoke('get-settings'),
  chooseProjectFolder: async () => ipcRenderer.invoke('choose-project-folder'),
  setAutoUpdate: async (value: boolean) => ipcRenderer.invoke('set-auto-update', value),
  onProjectFolderSelected: (callback: (folder: string) => void) => {
    ipcRenderer.on('project-folder-selected', (_, folder: string) => callback(folder));
  },
  requestAppVersion: () => ipcRenderer.send('request-app-version'),
  onAppVersion: (callback: (version: string) => void) => {
    ipcRenderer.on('app-version', (_, version: string) => callback(version));
  }
});

declare global {
  interface Window {
    electronAPI: {
      getSettings: () => Promise<{ projectFolder?: string; autoUpdate: boolean; darkMode: boolean }>;
      chooseProjectFolder: () => Promise<string | undefined>;
      setAutoUpdate: (value: boolean) => Promise<void>;
      onProjectFolderSelected: (callback: (folder: string) => void) => void;
      requestAppVersion: () => void;
      onAppVersion: (callback: (version: string) => void) => void;
    };
  }
}
