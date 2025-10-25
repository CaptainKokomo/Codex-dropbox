import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';
import { useCanvas } from './canvasStore';

export type Overlay = {
  id: string;
  text: string;
  position: { x: number; y: number };
  type: 'success' | 'warning';
};

type ErrorMessage = {
  id: string;
  message: string;
};

type SimulationState = {
  isRunning: boolean;
  overlays: Overlay[];
  multimeter: { voltage: number; current: number };
  oscilloscope: {
    channelA: { frequency: number };
    channelB: { frequency: number };
  };
  errors: ErrorMessage[];
  run: () => void;
  pause: () => void;
  reset: () => void;
  acknowledgeError: (id: string) => void;
};

const worker = new Worker(new URL('../simulation/simulationWorker.ts', import.meta.url), {
  type: 'module',
});

export const useSimulation = create<SimulationState>((set) => ({
  isRunning: false,
  overlays: [],
  multimeter: { voltage: 0, current: 0 },
  oscilloscope: {
    channelA: { frequency: 0 },
    channelB: { frequency: 0 },
  },
  errors: [],
  run: () => {
    worker.postMessage({ type: 'run' });
    set({ isRunning: true });
  },
  pause: () => {
    worker.postMessage({ type: 'pause' });
    set({ isRunning: false });
  },
  reset: () => {
    worker.postMessage({ type: 'reset' });
    set({
      overlays: [],
      multimeter: { voltage: 0, current: 0 },
      oscilloscope: { channelA: { frequency: 0 }, channelB: { frequency: 0 } },
    });
  },
  acknowledgeError: (id: string) => set((state) => ({ errors: state.errors.filter((error) => error.id !== id) })),
}));

worker.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  if (type === 'tick') {
    useSimulation.setState({
      overlays: payload.overlays,
      multimeter: payload.multimeter,
      oscilloscope: payload.oscilloscope,
    });
  }
  if (type === 'error') {
    const errorMessage: ErrorMessage = { id: nanoid(), message: payload.message };
    useSimulation.setState((state) => ({ errors: [...state.errors, errorMessage] }));
  }
});

useCanvas.subscribe((state) => {
  worker.postMessage({ type: 'updateCircuit', payload: state });
});
