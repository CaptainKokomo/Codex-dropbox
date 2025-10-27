import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { ComponentDefinition, ProjectState } from '@shared/types';
import { componentRegistry } from '@shared/components/registry';
import { SimulationBridge } from '@simulation/bridge';
import { tutorialFlow } from '../utils/tutorialFlow';

export type ThemeMode = 'beginner' | 'detailed';

interface AppStoreState extends ProjectState {
  initialized: boolean;
  themeMode: ThemeMode;
  tipsEnabled: boolean;
  settingsOpen: boolean;
  activeComponentId?: string;
  autoUpdateEnabled: boolean;
  rendererReady: boolean;
  initializeApp: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTips: () => void;
  setSettingsOpen: (open: boolean) => void;
  setActiveComponent: (id: string | undefined) => void;
  addComponent: (component: ComponentDefinition, position: { x: number; y: number }) => void;
  updateComponent: (id: string, changes: Partial<ComponentDefinition>) => void;
  removeComponent: (id: string) => void;
  registerConnection: (sourceKey: string, targetKey: string) => void;
  removeConnection: (connectionId: string) => void;
  pushTelemetryEvent: (event: string, data?: Record<string, unknown>) => void;
}

const simulationBridge = new SimulationBridge();

export const useAppStore = create<AppStoreState>()(
  persist(
    immer((set, get) => ({
      initialized: false,
      themeMode: 'beginner',
      tipsEnabled: true,
      settingsOpen: false,
      autoUpdateEnabled: true,
      rendererReady: false,
      components: [],
      connections: [],
      tutorialState: tutorialFlow.initialState,
      guidance: { messages: [] },
      pushTelemetryEvent: (event, data) => {
        window.dispatchEvent(
          new CustomEvent('nodelab-telemetry', {
            detail: { event, data, timestamp: Date.now() }
          })
        );
      },
      initializeApp: () => {
        if (!get().initialized) {
          simulationBridge.initialize((payload) => {
            if (payload.type === 'simulation-update') {
              set((draft) => {
                draft.simulation = payload.data;
              });
            }
            if (payload.type === 'coach-message') {
              set((draft) => {
                draft.guidance.messages.unshift(payload.data);
                draft.guidance.messages = draft.guidance.messages.slice(0, 6);
              });
            }
          });
          tutorialFlow.bootstrap(set, get);
          set((draft) => {
            draft.initialized = true;
          });
        }
      },
      setThemeMode: (mode) =>
        set((draft) => {
          draft.themeMode = mode;
        }),
      toggleTips: () =>
        set((draft) => {
          draft.tipsEnabled = !draft.tipsEnabled;
        }),
      setSettingsOpen: (open) =>
        set((draft) => {
          draft.settingsOpen = open;
        }),
      setActiveComponent: (id) =>
        set((draft) => {
          draft.activeComponentId = id;
        }),
      addComponent: (component, position) => {
        const id = `${component.id}-${Date.now()}`;
        set((draft) => {
          draft.components.push({
            ...component,
            runtimeId: id,
            position,
            defaultValues: { ...component.defaultValues }
          });
          draft.activeComponentId = id;
        });
        simulationBridge.enqueue({ type: 'add-component', payload: { component, position, id } });
      },
      updateComponent: (id, changes) => {
        set((draft) => {
          const existing = draft.components.find((c) => c.runtimeId === id);
          if (existing) {
            Object.assign(existing, changes);
          }
        });
        simulationBridge.enqueue({ type: 'update-component', payload: { id, changes } });
      },
      removeComponent: (id) => {
        set((draft) => {
          draft.components = draft.components.filter((c) => c.runtimeId !== id);
          draft.connections = draft.connections.filter(
            (connection) => connection.from.componentId !== id && connection.to.componentId !== id
          );
        });
        simulationBridge.enqueue({ type: 'remove-component', payload: { id } });
      },
      registerConnection: (sourceKey, targetKey) => {
        if (!sourceKey || !targetKey || sourceKey === targetKey) return;
        const [sourceComponent, sourceNode] = sourceKey.split(':');
        const [targetComponent, targetNode] = targetKey.split(':');
        if (!sourceComponent || !targetComponent) return;
        const existing = get().connections.find(
          (connection) =>
            connection.from.componentId === sourceComponent &&
            connection.from.nodeId === sourceNode &&
            connection.to.componentId === targetComponent &&
            connection.to.nodeId === targetNode
        );
        if (existing) return;
        const connectionId = `${sourceKey}-${targetKey}-${Date.now()}`;
        set((draft) => {
          draft.connections.push({
            id: connectionId,
            from: { componentId: sourceComponent, nodeId: sourceNode },
            to: { componentId: targetComponent, nodeId: targetNode },
            metadata: { createdAt: Date.now() }
          });
        });
        simulationBridge.enqueue({
          type: 'connect',
          payload: { id: connectionId, from: sourceKey, to: targetKey }
        });
      },
      removeConnection: (connectionId) => {
        set((draft) => {
          draft.connections = draft.connections.filter((connection) => connection.id !== connectionId);
        });
        simulationBridge.enqueue({ type: 'disconnect', payload: { id: connectionId } });
      }
    })),
    {
      name: 'nodelab-store',
      version: 1
    }
  )
);

export const availableComponents = Object.values(componentRegistry);
