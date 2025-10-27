import type { ComponentInstance, Wire } from '../state/circuitTypes';

export interface SimulationRequest {
  components: ComponentInstance[];
  wires: Wire[];
  status: 'running' | 'paused' | 'idle';
}

export interface SimulationResponse {
  readings: {
    componentId: string;
    nodeId: string;
    voltage: number;
    current: number;
  }[];
  warnings: string[];
}

self.onmessage = (event: MessageEvent<SimulationRequest>) => {
  const { components, wires, status } = event.data;
  if (status !== 'running') {
    postMessage({ readings: [], warnings: [] } satisfies SimulationResponse);
    return;
  }

  const readings = components.flatMap((component) =>
    component.nodes.map((node, index) => ({
      componentId: component.id,
      nodeId: node.id,
      voltage: Math.sin(Date.now() / 1000 + index) * 5 + 5,
      current: Math.abs(Math.cos(Date.now() / 1000 + index)) * 0.02
    }))
  );

  const warnings: string[] = [];
  if (wires.length === 0) {
    warnings.push('No wires yet—drag from a node to start a connection.');
  }

  postMessage({ readings, warnings } satisfies SimulationResponse);
};

export {}; // ensure module scope
