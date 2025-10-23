import { contextBridge, ipcRenderer } from 'electron';
import { AppIpcChannels, NodeLabApi } from '@shared/types/ipc';

const api: NodeLabApi = {
  chooseProjectFolder: () => ipcRenderer.invoke(AppIpcChannels.CHOOSE_PROJECT_FOLDER),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (payload) => ipcRenderer.invoke('settings:update', payload),
  saveProject: (payload) => ipcRenderer.invoke(AppIpcChannels.SAVE_PROJECT, payload),
  loadProject: (filePath) => ipcRenderer.invoke(AppIpcChannels.LOAD_PROJECT, filePath),
  exportFile: (payload) => ipcRenderer.invoke(AppIpcChannels.EXPORT_FILE, payload),
  openLink: (url) => ipcRenderer.invoke(AppIpcChannels.OPEN_LINK, url)
};

contextBridge.exposeInMainWorld('NodeLab', api);

declare global {
  interface Window {
    NodeLab: NodeLabApi;
  }
}
