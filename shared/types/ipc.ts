export enum AppIpcChannels {
  CHOOSE_PROJECT_FOLDER = 'app:chooseProjectFolder',
  SAVE_PROJECT = 'app:saveProject',
  LOAD_PROJECT = 'app:loadProject',
  EXPORT_FILE = 'app:exportFile',
  OPEN_LINK = 'app:openLink'
}

export interface NodeLabApi {
  chooseProjectFolder(): Promise<string>;
  getSettings(): Promise<Record<string, unknown>>;
  updateSettings(payload: Partial<Record<string, unknown>>): Promise<Record<string, unknown>>;
  saveProject(payload: { fileName: string; data: string }): Promise<string>;
  loadProject(filePath: string): Promise<string>;
  exportFile(payload: {
    dialogTitle: string;
    defaultPath: string;
    data: string | Buffer;
    filters?: Electron.FileFilter[];
  }): Promise<string | null>;
  openLink(url: string): Promise<void>;
}
