import { create } from 'zustand';
import type { ComponentBlueprint } from '../data/components';

export type PluginManifest = {
  id: string;
  name: string;
  version: string;
  components: ComponentBlueprint[];
};

type PluginState = {
  manifests: PluginManifest[];
  registerManifest: (manifest: PluginManifest) => void;
  getAllComponents: () => ComponentBlueprint[];
};

export const usePluginRegistry = create<PluginState>((set, get) => ({
  manifests: [],
  registerManifest: (manifest) =>
    set((state) => ({
      manifests: state.manifests.some((item) => item.id === manifest.id)
        ? state.manifests.map((item) => (item.id === manifest.id ? manifest : item))
        : [...state.manifests, manifest],
    })),
  getAllComponents: () => get().manifests.flatMap((manifest) => manifest.components),
}));
