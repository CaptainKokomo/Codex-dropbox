export type ComponentKind =
  | 'battery'
  | 'dc-source'
  | 'resistor'
  | 'capacitor'
  | 'led'
  | 'diode'
  | 'npn-transistor'
  | 'mosfet'
  | 'pushbutton'
  | 'potentiometer'
  | 'timer-555'
  | 'speaker';

export interface NodeAnchor {
  id: string;
  label: string;
  position: { x: number; y: number };
}

export interface ComponentInstance {
  id: string;
  kind: ComponentKind;
  name: string;
  position: { x: number; y: number };
  rotation: number;
  nodes: NodeAnchor[];
  value: string;
  metadata?: Record<string, unknown>;
}

export interface WireEnd {
  componentId: string;
  nodeId: string;
}

export interface Wire {
  id: string;
  from: WireEnd;
  to: WireEnd;
  tempTarget?: { x: number; y: number };
}

export interface CoachingMessage {
  id: string;
  text: string;
  severity: 'info' | 'warning' | 'error';
  createdAt: number;
}

export interface SimulationReading {
  componentId: string;
  nodeId: string;
  voltage: number;
  current: number;
}

export interface SimulationState {
  status: 'idle' | 'running' | 'paused';
  lastUpdated: number;
  readings: SimulationReading[];
}

export interface TutorialState {
  step: number;
  completed: boolean;
  overlay?: {
    title: string;
    body: string;
  };
}

export interface SettingsState {
  simpleLanguage: boolean;
  showTips: boolean;
  projectFolder?: string;
  autoUpdate: boolean;
  darkMode: boolean;
}

export interface CircuitState {
  components: ComponentInstance[];
  wires: Wire[];
  selectedComponentId?: string;
  selectedWireId?: string;
  wireDraft?: Wire;
  hoveredNode?: {
    componentId: string;
    nodeId: string;
  };
  zoom: number;
  offset: { x: number; y: number };
  simulation: SimulationState;
  coaching: CoachingMessage[];
  tutorial: TutorialState;
  settings: SettingsState;
  ui: {
    settingsOpen: boolean;
    contextMenu?: ContextMenuState;
    valueEditorComponentId?: string;
  };
  history: CircuitHistory;
}

export interface CircuitHistory {
  past: Pick<CircuitState, 'components' | 'wires'>[];
  future: Pick<CircuitState, 'components' | 'wires'>[];
}

export interface ContextMenuState {
  position: { x: number; y: number };
  target: { type: 'wire'; id: string } | { type: 'node'; componentId: string; nodeId: string };
}
