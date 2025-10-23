import type { CircuitComponent, SimulationResult, WireConnection } from '@state/types';
import { evaluateDiagnostics } from './diagnostics';

export interface SimulationRequest {
  components: CircuitComponent[];
  wires: WireConnection[];
  advancedMode: boolean;
}

export function runRealtimeSimulation({
  components,
  wires,
  advancedMode
}: SimulationRequest): SimulationResult {
  const diagnostics = evaluateDiagnostics(components, wires, advancedMode);

  const timestamp = Date.now();
  const nodes: SimulationResult['nodes'] = {};

  components.forEach((component) => {
    component.terminals.forEach((terminal) => {
      const nodeKey = `${component.id}:${terminal.id}`;
      nodes[nodeKey] = {
        voltage: guessVoltage(component.type, terminal.polarity),
        current: guessCurrent(component.type)
      };
    });
  });

  return {
    timestamp,
    nodes,
    diagnostics,
    metadata: {
      frequency: estimateFrequency(components, wires)
    }
  };
}

function guessVoltage(type: string, polarity: string): number {
  if (type === 'battery') {
    return polarity === '+' ? 5 : 0;
  }
  if (type === 'led') {
    return polarity === '+' ? 2.1 : 0;
  }
  if (type === 'prefab-555-blinker') {
    return polarity.includes('+') ? 3.3 : 0.2;
  }
  return polarity === '+' ? 5 : 0;
}

function guessCurrent(type: string): number {
  switch (type) {
    case 'resistor':
      return 0.015;
    case 'led':
      return 0.012;
    case 'prefab-555-blinker':
      return 0.02;
    default:
      return 0.005;
  }
}

function estimateFrequency(components: CircuitComponent[], wires: WireConnection[]): number {
  const hasTimer = components.some((component) => component.type === 'timer555' || component.type === 'prefab-555-blinker');
  const hasCapacitor = components.some((component) => component.type === 'capacitor');
  const hasResistor = components.some((component) => component.type === 'resistor');

  if (hasTimer && hasCapacitor && hasResistor) {
    const complexity = Math.max(wires.length, 1);
    return Number((2 / complexity).toFixed(2));
  }
  return 0;
}
