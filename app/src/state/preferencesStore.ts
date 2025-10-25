import { create } from 'zustand';

type PreferencesState = {
  projectDirectory?: string;
  hydratePreferences: () => Promise<void>;
  setProjectDirectory: (directory: string) => void;
};

export const usePreferences = create<PreferencesState>((set) => ({
  projectDirectory: undefined,
  hydratePreferences: async () => {
    if (!window.nodelab) return;
    const prefs = await window.nodelab.getPreferences();
    if (typeof prefs.projectDirectory === 'string') {
      set({ projectDirectory: prefs.projectDirectory });
    }
  },
  setProjectDirectory: (directory: string) => set({ projectDirectory: directory }),
}));
