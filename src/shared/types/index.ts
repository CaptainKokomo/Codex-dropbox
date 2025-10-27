export interface ConnectionTerminal {
  componentId: string;
  nodeId?: string;
}

export interface Connection {
  id: string;
  from: ConnectionTerminal;
  to: ConnectionTerminal;
  metadata?: Record<string, unknown>;
}

export interface ComponentNode {
  id: string;
  label: string;
  polarity?: '+' | '-' | 'gate' | 'source' | 'drain';
  position: { x: number; y: number };
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  defaultValues: Record<string, number | string>;
  editableFields: Array<{
    key: string;
    label: string;
    type: 'number' | 'select' | 'text';
    options?: Array<{ label: string; value: string }>;
    min?: number;
    max?: number;
  }>;
  nodes: ComponentNode[];
  runtimeId?: string;
  position?: { x: number; y: number };
  labelOverride?: string;
}

export interface SimulationSnapshot {
  timestamp: number;
  nodeVoltages: Record<string, number>;
  nodeCurrents: Record<string, number>;
  faults: string[];
}

export interface GuidanceState {
  messages: Array<{ id: string; level: 'info' | 'warning' | 'success'; text: string }>;
}

export interface TutorialState {
  stepId: string;
  completed: boolean;
  overlayMessage?: string;
}

export interface ProjectState {
  components: ComponentDefinition[];
  connections: Connection[];
  simulation?: SimulationSnapshot;
  guidance: GuidanceState;
  tutorialState: TutorialState;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  components: ComponentDefinition[];
}

export interface RendererAdapter {
  mount: (options: { container: HTMLDivElement }) => void;
  unmount: () => void;
  addComponentInstance: (component: ComponentDefinition) => void;
  removeComponentInstance: (id: string) => void;
  setConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  highlightNode: (componentId: string, nodeId: string) => void;
  onContextMenu: (handler: (event: { type: 'wire' | 'node'; id: string }) => void) => void;
  onNodeEdit: (handler: (componentId: string, nodeId: string) => void) => void;
  updateSimulation: (snapshot: SimulationSnapshot) => void;
  cleanupComponents?: (active: Set<string>) => void;
  cleanupConnections?: (active: Set<string>) => void;
  onWireComplete?: (handler: (from: string, to: string) => void) => void;
  onWirePreview?: (handler: (componentId: string, nodeId: string | null) => void) => void;
}
