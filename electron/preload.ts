import { contextBridge, ipcRenderer } from 'electron';
import type { TelemetryEvent, UserPreferences } from '../shared/preferences.js';

const api = {
  getPreferences: async (): Promise<UserPreferences> => ipcRenderer.invoke('preferences:get'),
  updatePreferences: async (update: Partial<UserPreferences>): Promise<UserPreferences> =>
    ipcRenderer.invoke('preferences:update', update),
  chooseFolder: async (): Promise<string | null> => ipcRenderer.invoke('preferences:choose-folder'),
  recordTelemetry: async (event: TelemetryEvent) => ipcRenderer.invoke('telemetry:record', event),
};

contextBridge.exposeInMainWorld('nodelab', api);

declare global {
  interface Window {
    nodelab: typeof api;
  }
}
