declare interface ElectronAPI {
  getSettings: () => Promise<{ projectFolder?: string; autoUpdate: boolean; darkMode: boolean }>;
  chooseProjectFolder: () => Promise<string | undefined>;
  setAutoUpdate: (value: boolean) => Promise<void>;
  onProjectFolderSelected: (callback: (folder: string) => void) => void;
  requestAppVersion: () => void;
  onAppVersion: (callback: (version: string) => void) => void;
}

declare interface Window {
  electronAPI: ElectronAPI;
}
