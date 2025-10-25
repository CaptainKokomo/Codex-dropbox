export {};

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
