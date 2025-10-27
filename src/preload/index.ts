import { contextBridge, ipcRenderer } from 'electron';

declare global {
  interface Window {
    nodelab: {
      getProjectFolder: () => Promise<string | undefined>;
      setProjectFolder: (folder: string) => Promise<void>;
      getAutoUpdate: () => Promise<boolean>;
      setAutoUpdate: (enabled: boolean) => Promise<void>;
    };
  }
}

contextBridge.exposeInMainWorld('nodelab', {
  getProjectFolder: () => ipcRenderer.invoke('project-folder:get'),
  setProjectFolder: (folder: string) => ipcRenderer.invoke('project-folder:set', folder),
  getAutoUpdate: () => ipcRenderer.invoke('auto-update:get'),
  setAutoUpdate: (enabled: boolean) => ipcRenderer.invoke('auto-update:set', enabled)
});
