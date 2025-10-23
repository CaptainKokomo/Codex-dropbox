export type LanguageMode = 'simple' | 'detailed';
export type TerminalPolarity = '+' | '-' | 'gate' | 'source' | 'drain' | 'collector' | 'emitter' | 'input' | 'output' | 'control';

export interface CircuitTerminal {
  id: string;
  label: string;
  polarity: TerminalPolarity;
  position: { x: number; y: number };
}

export interface CircuitComponent {
  id: string;
  type: string;
  name: string;
  description: string;
  category: 'power' | 'passive' | 'active' | 'io' | 'prefab';
  terminals: CircuitTerminal[];
  value?: string;
  editableValues?: Array<{
    key: string;
    label: string;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    defaultValue: number;
  }>;
  metadata?: Record<string, unknown>;
  prefab?: boolean;
  position?: { x: number; y: number };
  rotation?: number;
}

export interface WireConnection {
  id: string;
  from: { componentId: string; terminalId: string };
  to: { componentId: string; terminalId: string };
  path: Array<{ x: number; y: number }>;
}

export interface BlueprintMetadata {
  title: string;
  description: string;
  projectType: 'breadboard' | 'perfboard' | 'pcb';
  lastModified: number;
  bom: Array<{ reference: string; quantity: number; partNumber?: string; notes?: string }>;
  pcbExport?: {
    format: 'json' | 'gerber';
    fileName: string;
    providerHint?: 'pcbway' | 'jlcpcb' | 'oshpark' | 'other';
  };
}

export interface CircuitProject {
  id: string;
  name: string;
  components: CircuitComponent[];
  wires: WireConnection[];
  notes: string;
  blueprint: BlueprintMetadata;
  kits: CircuitKitReference[];
  createdAt: number;
  updatedAt: number;
}

export interface CircuitKitReference {
  id: string;
  title: string;
  contents: Array<{ componentType: string; quantity: number; notes?: string }>;
  tags: string[];
  isGamified?: boolean;
}

export interface SimulationResult {
  timestamp: number;
  nodes: Record<string, {
    voltage: number;
    current: number;
  }>;
  diagnostics: DiagnosticMessage[];
  metadata?: Record<string, number | string | boolean>;
}

export type DiagnosticSeverity = 'info' | 'warning' | 'error' | 'success';

export interface DiagnosticMessage {
  id: string;
  severity: DiagnosticSeverity;
  title: string;
  description: string;
  hint?: string;
  componentId?: string;
  autoFixAction?: string;
}

export interface GamifiedMission {
  id: string;
  title: string;
  description: string;
  reward: string;
  prerequisites: string[];
  steps: Array<{
    id: string;
    instruction: string;
    successCheck: (state: NodeLabState) => boolean;
    hint: string;
  }>;
}

export interface GamifiedProgress {
  activeMissionId: string | null;
  completedMissions: string[];
  stepCompleted: Record<string, string[]>;
  experience: number;
  level: number;
}

export interface NodeLabState {
  projects: CircuitProject[];
  activeProjectId: string | null;
  selectedComponentId: string | null;
  simulation: SimulationResult | null;
  diagnostics: DiagnosticMessage[];
  languageMode: LanguageMode;
  showTips: boolean;
  autoUpdate: boolean;
  advancedMode: boolean;
  gamifiedProgress: GamifiedProgress;
}

export interface NodeLabActions {
  createProject(name: string): void;
  updateProject(project: CircuitProject): void;
  setActiveProject(projectId: string): void;
  setSimulation(result: SimulationResult | null): void;
  setDiagnostics(diagnostics: DiagnosticMessage[]): void;
  setSelectedComponent(componentId: string | null): void;
  setLanguageMode(mode: LanguageMode): void;
  setTipsVisible(visible: boolean): void;
  setAutoUpdate(enabled: boolean): void;
  setAdvancedMode(enabled: boolean): void;
  updateGamifiedProgress(progress: Partial<GamifiedProgress>): void;
  addComponent(component: CircuitComponent): void;
  updateComponent(componentId: string, updates: Partial<CircuitComponent>): void;
  removeComponent(componentId: string): void;
  addWire(wire: WireConnection): void;
  updateWire(wireId: string, updates: Partial<WireConnection>): void;
  removeWire(wireId: string): void;
}

export type NodeLabStore = NodeLabState & NodeLabActions;
