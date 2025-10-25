/* eslint-disable no-restricted-globals */
import type { CanvasComponent, Wire } from '../state/canvasStore';

type SimulationState = {
  components: CanvasComponent[];
  wires: Wire[];
};

type WorkerState = {
  running: boolean;
  circuit?: SimulationState;
  time: number;
};

const workerState: WorkerState = {
  running: false,
  circuit: undefined,
  time: 0,
};

const STEP_MS = 100;

const evaluateCircuit = () => {
  const overlays = [] as any[];
  const multimeter = { voltage: 0, current: 0 };
  const oscilloscope = {
    channelA: { frequency: 0 },
    channelB: { frequency: 0 },
  };

  if (!workerState.circuit) {
    return { overlays, multimeter, oscilloscope };
  }

  const hasLed = workerState.circuit.components.some((component) => component.type === 'led');
  const hasBlinker = workerState.circuit.components.some((component) => component.type === 'prefabBlinker');

  if (hasLed && hasBlinker) {
    const brightness = (Math.sin(workerState.time / 400) + 1) / 2;
    overlays.push({
      id: 'led-glow',
      text: brightness > 0.5 ? 'LED glowing' : 'LED dim',
      position: { x: 420, y: 200 },
      type: 'success',
    });
    multimeter.voltage = 2 + brightness * 2;
    multimeter.current = 0.01 + brightness * 0.02;
    oscilloscope.channelA.frequency = 2;
  }

  const shortCircuit = workerState.circuit.wires.some((wire) => wire.from.componentId === wire.to.componentId);
  if (shortCircuit) {
    overlays.push({
      id: 'short-warning',
      text: 'Check wiring — nodes joined on same part',
      position: { x: 180, y: 120 },
      type: 'warning',
    });
  }

  return { overlays, multimeter, oscilloscope };
};

const tick = () => {
  if (!workerState.running) return;
  workerState.time += STEP_MS;
  const result = evaluateCircuit();
  postMessage({ type: 'tick', payload: result });
  setTimeout(tick, STEP_MS);
};

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;
  if (type === 'run') {
    workerState.running = true;
    tick();
  }
  if (type === 'pause') {
    workerState.running = false;
  }
  if (type === 'reset') {
    workerState.running = false;
    workerState.time = 0;
    postMessage({
      type: 'tick',
      payload: { overlays: [], multimeter: { voltage: 0, current: 0 }, oscilloscope: { channelA: { frequency: 0 }, channelB: { frequency: 0 } } },
    });
  }
  if (type === 'updateCircuit') {
    workerState.circuit = payload;
  }
};
