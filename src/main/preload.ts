import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nodelab', {
  getPreferences: () => ipcRenderer.invoke('preferences:get'),
  chooseProjectDir: (suggested?: string) => ipcRenderer.invoke('preferences:setProjectDir', suggested),
  saveProject: (filename: string, data: string) => ipcRenderer.invoke('file:saveProject', filename, data),
  exportImage: (filename: string, dataUrl: string) => ipcRenderer.invoke('file:exportImage', filename, dataUrl),
});

declare global {
  interface Window {
    nodelab: {
      getPreferences: () => Promise<Record<string, unknown>>;
      chooseProjectDir: (suggested?: string) => Promise<string | undefined>;
      saveProject: (filename: string, data: string) => Promise<string>;
      exportImage: (filename: string, dataUrl: string) => Promise<string>;
    };
  }
}
