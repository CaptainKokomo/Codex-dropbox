import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('brain', {
  listTree: () => ipcRenderer.invoke('storage:list'),
  readNote: (payload) => ipcRenderer.invoke('storage:readNote', payload),
  writeNote: (payload) => ipcRenderer.invoke('storage:writeNote', payload),
  create: (payload) => ipcRenderer.invoke('storage:create', payload),
  deleteNote: (payload) => ipcRenderer.invoke('storage:deleteNote', payload),
  rename: (payload) => ipcRenderer.invoke('storage:rename', payload),
  listTags: () => ipcRenderer.invoke('storage:tags'),
  structured: (payload) => ipcRenderer.invoke('storage:structured', payload),
  search: (payload) => ipcRenderer.invoke('storage:search', payload),
  aiApply: (payload) => ipcRenderer.invoke('ai:apply', payload),
  aiSnapshot: (payload) => ipcRenderer.invoke('ai:snapshot', payload),
  listSnapshots: (payload) => ipcRenderer.invoke('storage:snapshots', payload),
  readSnapshot: (payload) => ipcRenderer.invoke('storage:readSnapshot', payload),
  quickCapture: (payload) => ipcRenderer.invoke('quickCapture', payload),
  onStorageUpdate: (callback) => {
    ipcRenderer.removeAllListeners('storage:updated');
    ipcRenderer.on('storage:updated', callback);
  },
});
