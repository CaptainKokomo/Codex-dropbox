import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import type {
  CircuitState,
  ComponentInstance,
  Wire,
  WireEnd
} from './circuitTypes';
import { componentLibrary, instantiateComponent } from './componentLibrary';

const initialState: CircuitState = {
  components: [],
  wires: [],
  zoom: 1,
  offset: { x: 0, y: 0 },
  simulation: {
    status: 'idle',
    lastUpdated: Date.now(),
    readings: []
  },
  coaching: [],
  tutorial: {
    step: 0,
    completed: false,
    overlay: {
      title: 'Blink an LED',
      body: 'Drop a battery, resistor, LED, and timer. Wire them in a loop, then press Run.'
    }
  },
  settings: {
    simpleLanguage: true,
    showTips: true,
    autoUpdate: true,
    darkMode: true,
    projectFolder: undefined
  },
  ui: {
    settingsOpen: false,
    contextMenu: undefined,
    valueEditorComponentId: undefined
  },
  history: {
    past: [],
    future: []
  }
};

export interface CircuitActions {
  addComponent: (kind: ComponentInstance['kind'], position: { x: number; y: number }) => void;
  updateComponentPosition: (id: string, position: { x: number; y: number }) => void;
  rotateComponent: (id: string, direction: 1 | -1) => void;
  updateComponentValue: (id: string, value: string) => void;
  selectComponent: (id?: string) => void;
  selectWire: (id?: string) => void;
  startWire: (from: WireEnd) => void;
  updateWireDraft: (position: { x: number; y: number }, hovered?: WireEnd) => void;
  finalizeWire: (to: WireEnd) => void;
  cancelWire: () => void;
  deleteWire: (id: string) => void;
  setHoveredNode: (node?: WireEnd) => void;
  setZoom: (zoom: number) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  addCoachingMessage: (text: string, severity?: 'info' | 'warning' | 'error') => void;
  clearCoaching: () => void;
  updateSettings: (changes: Partial<CircuitState['settings']>) => void;
  registerSimulationReadings: (readings: CircuitState['simulation']['readings']) => void;
  setSimulationStatus: (status: CircuitState['simulation']['status']) => void;
  undo: () => void;
  redo: () => void;
  loadProject: (data: { components: ComponentInstance[]; wires: Wire[] }) => void;
  openSettings: () => void;
  closeSettings: () => void;
  showContextMenu: (context: NonNullable<CircuitState['ui']['contextMenu']>) => void;
  hideContextMenu: () => void;
  openValueEditor: (componentId: string) => void;
  closeValueEditor: () => void;
}

type Store = CircuitState & CircuitActions;

const pushHistory = (state: CircuitState) => {
  state.history.past.push({
    components: JSON.parse(JSON.stringify(state.components)),
    wires: JSON.parse(JSON.stringify(state.wires))
  });
  state.history.future = [];
};

export const useCircuitStore = create<Store>()(
  devtools((set, get) => ({
    ...initialState,
    addComponent: (kind, position) =>
      set(
        produce<CircuitState>((state) => {
          pushHistory(state);
          const component = instantiateComponent(kind, position);
          state.components.push(component);
          state.selectedComponentId = component.id;
        }),
        false,
        `add_component_${kind}`
      ),
    updateComponentPosition: (id, position) =>
      set(
        produce<CircuitState>((state) => {
          const component = state.components.find((item) => item.id === id);
          if (component) {
            component.position = position;
          }
        }),
        false,
        'move_component'
      ),
    rotateComponent: (id, direction) =>
      set(
        produce<CircuitState>((state) => {
          const component = state.components.find((item) => item.id === id);
          if (component) {
            component.rotation = (component.rotation + 90 * direction + 360) % 360;
          }
        }),
        false,
        'rotate_component'
      ),
    updateComponentValue: (id, value) =>
      set(
        produce<CircuitState>((state) => {
          const component = state.components.find((item) => item.id === id);
          if (component) {
            component.value = value;
          }
        }),
        false,
        'update_component_value'
      ),
    selectComponent: (id) =>
      set(
        produce<CircuitState>((state) => {
          state.selectedComponentId = id;
          state.selectedWireId = undefined;
        }),
        false,
        'select_component'
      ),
    selectWire: (id) =>
      set(
        produce<CircuitState>((state) => {
          state.selectedWireId = id;
          if (id) {
            state.selectedComponentId = undefined;
          }
        }),
        false,
        'select_wire'
      ),
    startWire: (from) =>
      set(
        produce<CircuitState>((state) => {
          state.wireDraft = {
            id: `draft-${nanoid()}`,
            from,
            to: from,
            tempTarget: undefined
          };
          state.hoveredNode = from;
        }),
        false,
        'start_wire'
      ),
    updateWireDraft: (position, hovered) =>
      set(
        produce<CircuitState>((state) => {
          if (state.wireDraft) {
            state.wireDraft.tempTarget = position;
            state.hoveredNode = hovered;
          }
        }),
        false,
        'update_wire_draft'
      ),
    finalizeWire: (to) =>
      set(
        produce<CircuitState>((state) => {
          const draft = state.wireDraft;
          if (!draft) {
            return;
          }
          if (draft.from.componentId === to.componentId && draft.from.nodeId === to.nodeId) {
            state.wireDraft = undefined;
            state.hoveredNode = undefined;
            return;
          }
          const wire: Wire = {
            id: nanoid(),
            from: draft.from,
            to
          };
          pushHistory(state);
          state.wires.push(wire);
          state.selectedWireId = wire.id;
          state.wireDraft = undefined;
          state.hoveredNode = undefined;
        }),
        false,
        'finalize_wire'
      ),
    cancelWire: () =>
      set(
        produce<CircuitState>((state) => {
          state.wireDraft = undefined;
          state.hoveredNode = undefined;
        }),
        false,
        'cancel_wire'
      ),
    deleteWire: (id) =>
      set(
        produce<CircuitState>((state) => {
          pushHistory(state);
          state.wires = state.wires.filter((wire) => wire.id !== id);
          if (state.selectedWireId === id) {
            state.selectedWireId = undefined;
          }
        }),
        false,
        'delete_wire'
      ),
    setHoveredNode: (node) =>
      set(
        produce<CircuitState>((state) => {
          state.hoveredNode = node;
        }),
        false,
        'hover_node'
      ),
    setZoom: (zoom) =>
      set(
        produce<CircuitState>((state) => {
          state.zoom = Math.min(2.5, Math.max(0.4, zoom));
        }),
        false,
        'set_zoom'
      ),
    setOffset: (offset) =>
      set(
        produce<CircuitState>((state) => {
          state.offset = offset;
        }),
        false,
        'set_offset'
      ),
    addCoachingMessage: (text, severity = 'info') =>
      set(
        produce<CircuitState>((state) => {
          state.coaching.push({
            id: nanoid(),
            text,
            severity,
            createdAt: Date.now()
          });
        }),
        false,
        'add_coaching'
      ),
    clearCoaching: () =>
      set(
        produce<CircuitState>((state) => {
          state.coaching = [];
        }),
        false,
        'clear_coaching'
      ),
    updateSettings: (changes) =>
      set(
        produce<CircuitState>((state) => {
          state.settings = { ...state.settings, ...changes };
        }),
        false,
        'update_settings'
      ),
    openSettings: () =>
      set(
        produce<CircuitState>((state) => {
          state.ui.settingsOpen = true;
        }),
        false,
        'open_settings'
      ),
    closeSettings: () =>
      set(
        produce<CircuitState>((state) => {
          state.ui.settingsOpen = false;
        }),
        false,
        'close_settings'
      ),
    showContextMenu: (context) =>
      set(
        produce<CircuitState>((state) => {
          state.ui.contextMenu = context;
        }),
        false,
        'show_context_menu'
      ),
    hideContextMenu: () =>
      set(
        produce<CircuitState>((state) => {
          state.ui.contextMenu = undefined;
        }),
        false,
        'hide_context_menu'
      ),
    openValueEditor: (componentId) =>
      set(
        produce<CircuitState>((state) => {
          state.ui.valueEditorComponentId = componentId;
          state.selectedComponentId = componentId;
        }),
        false,
        'open_value_editor'
      ),
    closeValueEditor: () =>
      set(
        produce<CircuitState>((state) => {
          state.ui.valueEditorComponentId = undefined;
        }),
        false,
        'close_value_editor'
      ),
    registerSimulationReadings: (readings) =>
      set(
        produce<CircuitState>((state) => {
          state.simulation.readings = readings;
          state.simulation.lastUpdated = Date.now();
        }),
        false,
        'simulation_readings'
      ),
    setSimulationStatus: (status) =>
      set(
        produce<CircuitState>((state) => {
          state.simulation.status = status;
        }),
        false,
        'simulation_status'
      ),
    undo: () =>
      set(
        produce<CircuitState>((state) => {
          const previous = state.history.past.pop();
          if (!previous) return;
          state.history.future.unshift({ components: state.components, wires: state.wires });
          state.components = JSON.parse(JSON.stringify(previous.components));
          state.wires = JSON.parse(JSON.stringify(previous.wires));
        }),
        false,
        'undo'
      ),
    redo: () =>
      set(
        produce<CircuitState>((state) => {
          const next = state.history.future.shift();
          if (!next) return;
          state.history.past.push({ components: state.components, wires: state.wires });
          state.components = JSON.parse(JSON.stringify(next.components));
          state.wires = JSON.parse(JSON.stringify(next.wires));
        }),
        false,
        'redo'
      ),
    loadProject: (data) =>
      set(
        produce<CircuitState>((state) => {
          pushHistory(state);
          state.components = data.components;
          state.wires = data.wires;
        }),
        false,
        'load_project'
      )
  }))
);

export const availableComponents = componentLibrary;
