import { nanoid } from 'nanoid/non-secure';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';
import type {
  CircuitComponent,
  CircuitProject,
  GamifiedProgress,
  NodeLabState,
  NodeLabStore,
  WireConnection
} from './types';

const defaultProject = (): CircuitProject => {
  const now = Date.now();
  return {
    id: nanoid(),
    name: 'Blink an LED',
    components: [],
    wires: [],
    notes: 'Your first NodeLab project. Drop parts from the left palette and connect them on the grid.',
    blueprint: {
      title: 'Starter Blink',
      description: 'Basic astable 555 timer powering an LED with current limiting resistor.',
      projectType: 'breadboard',
      lastModified: now,
      bom: [
        { reference: 'Battery', quantity: 1, notes: '9 V or 5 V DC supply' },
        { reference: 'Resistor', quantity: 1, notes: '330 Ω for safe LED brightness' },
        { reference: 'LED', quantity: 1 },
        { reference: '555 Timer', quantity: 1 },
        { reference: 'Capacitor', quantity: 1, notes: '10 µF for ~2 Hz blink' }
      ],
      pcbExport: {
        format: 'json',
        fileName: 'starter-blink.json',
        providerHint: 'pcbway'
      }
    },
    kits: [],
    createdAt: now,
    updatedAt: now
  };
};

const baseGamifiedProgress: GamifiedProgress = {
  activeMissionId: null,
  completedMissions: [],
  stepCompleted: {},
  experience: 0,
  level: 1
};

const initialState: NodeLabState = {
  projects: [defaultProject()],
  activeProjectId: null,
  selectedComponentId: null,
  simulation: null,
  diagnostics: [],
  languageMode: 'simple',
  showTips: true,
  autoUpdate: true,
  advancedMode: false,
  gamifiedProgress: baseGamifiedProgress
};

export const useNodeLabStore = create<NodeLabStore>()(
  immer((set) => ({
    ...initialState,
    createProject: (name: string) =>
      set((draft) => {
        const project = defaultProject();
        project.name = name;
        project.id = nanoid();
        project.createdAt = Date.now();
        project.updatedAt = Date.now();
        draft.projects.push(project);
        draft.activeProjectId = project.id;
      }),
    updateProject: (project: CircuitProject) =>
      set((draft) => {
        const index = draft.projects.findIndex((p) => p.id === project.id);
        if (index !== -1) {
          draft.projects[index] = project;
          draft.projects[index].updatedAt = Date.now();
        }
      }),
    setActiveProject: (projectId: string) =>
      set((draft) => {
        draft.activeProjectId = projectId;
      }),
    setSimulation: (result) =>
      set((draft) => {
        draft.simulation = result;
      }),
    setDiagnostics: (diagnostics) =>
      set((draft) => {
        draft.diagnostics = diagnostics;
      }),
    setSelectedComponent: (componentId) =>
      set((draft) => {
        draft.selectedComponentId = componentId;
      }),
    setLanguageMode: (mode) =>
      set((draft) => {
        draft.languageMode = mode;
      }),
    setTipsVisible: (visible) =>
      set((draft) => {
        draft.showTips = visible;
      }),
    setAutoUpdate: (enabled) =>
      set((draft) => {
        draft.autoUpdate = enabled;
      }),
    setAdvancedMode: (enabled) =>
      set((draft) => {
        draft.advancedMode = enabled;
      }),
    updateGamifiedProgress: (progress) =>
      set((draft) => {
        draft.gamifiedProgress = produce(draft.gamifiedProgress, (gp) => Object.assign(gp, progress));
      }),
    addComponent: (component: CircuitComponent) =>
      set((draft) => {
        const project = selectActiveProject(draft);
        if (!project) return;
        project.components.push(component);
        draft.selectedComponentId = component.id;
      }),
    updateComponent: (componentId: string, updates: Partial<CircuitComponent>) =>
      set((draft) => {
        const project = selectActiveProject(draft);
        if (!project) return;
        const component = project.components.find((item) => item.id === componentId);
        if (component) {
          Object.assign(component, updates);
        }
      }),
    removeComponent: (componentId: string) =>
      set((draft) => {
        const project = selectActiveProject(draft);
        if (!project) return;
        project.components = project.components.filter((component) => component.id !== componentId);
        project.wires = project.wires.filter(
          (wire) => wire.from.componentId !== componentId && wire.to.componentId !== componentId
        );
        if (draft.selectedComponentId === componentId) {
          draft.selectedComponentId = null;
        }
      }),
    addWire: (wire: WireConnection) =>
      set((draft) => {
        const project = selectActiveProject(draft);
        if (!project) return;
        project.wires.push(wire);
      }),
    updateWire: (wireId: string, updates: Partial<WireConnection>) =>
      set((draft) => {
        const project = selectActiveProject(draft);
        if (!project) return;
        const wire = project.wires.find((item) => item.id === wireId);
        if (wire) {
          Object.assign(wire, updates);
        }
      }),
    removeWire: (wireId: string) =>
      set((draft) => {
        const project = selectActiveProject(draft);
        if (!project) return;
        project.wires = project.wires.filter((wire) => wire.id !== wireId);
      })
  }))
);

export const selectActiveProject = (state: NodeLabState): CircuitProject | null => {
  if (!state.activeProjectId) {
    return state.projects[0] ?? null;
  }
  return state.projects.find((project) => project.id === state.activeProjectId) ?? null;
};
