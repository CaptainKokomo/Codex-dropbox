import { create } from 'zustand';
import { useCanvas } from './canvasStore';
import { usePreferences } from './preferencesStore';

const canvasToDataUrl = async (): Promise<string> => {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    throw new Error('Canvas not found');
  }
  return canvas.toDataURL('image/png');
};

type ProjectState = {
  saveProjectAs: () => Promise<void>;
  exportCanvasImage: () => Promise<void>;
};

export const useProject = create<ProjectState>(() => ({
  saveProjectAs: async () => {
    if (!window.nodelab) {
      console.warn('Save is only available inside the desktop app.');
      return;
    }
    const state = useCanvas.getState();
    const projectDirectory = usePreferences.getState().projectDirectory;
    if (!projectDirectory) {
      const chosen = await window.nodelab.chooseProjectDir();
      if (!chosen) return;
      usePreferences.getState().setProjectDirectory(chosen);
    }
    const payload = JSON.stringify({
      components: state.components,
      wires: state.wires,
    });
    await window.nodelab.saveProject(`nodelab-${Date.now()}`, payload);
  },
  exportCanvasImage: async () => {
    if (!window.nodelab) {
      console.warn('Export is only available inside the desktop app.');
      return;
    }
    const projectDirectory = usePreferences.getState().projectDirectory;
    if (!projectDirectory) {
      const chosen = await window.nodelab.chooseProjectDir();
      if (!chosen) return;
      usePreferences.getState().setProjectDirectory(chosen);
    }
    const dataUrl = await canvasToDataUrl();
    await window.nodelab.exportImage(`nodelab-${Date.now()}`, dataUrl);
  },
}));
