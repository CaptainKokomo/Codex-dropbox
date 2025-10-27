export {}; // ensure this file is a module

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
