import type { SimulationSnapshot } from '@shared/types';

export type SimulationEvent =
  | { type: 'simulation-update'; data: SimulationSnapshot }
  | { type: 'coach-message'; data: { id: string; level: 'info' | 'warning' | 'success'; text: string } };

type Dispatch = (event: SimulationEvent) => void;

type WorkerRequest =
  | { type: 'add-component'; payload: unknown }
  | { type: 'update-component'; payload: unknown }
  | { type: 'remove-component'; payload: unknown }
  | { type: 'connect'; payload: unknown }
  | { type: 'disconnect'; payload: unknown };

export class SimulationBridge {
  private worker?: Worker;
  private queue: WorkerRequest[] = [];
  private ready = false;
  private listeners: Dispatch[] = [];

  initialize(dispatch: Dispatch) {
    this.listeners.push(dispatch);
    if (this.worker) return;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.addEventListener('message', (event) => {
      const data = event.data as SimulationEvent;
      this.listeners.forEach((listener) => listener(data));
    });
    this.worker.addEventListener('error', (error) => {
      console.error('Simulation worker error', error);
    });
    this.worker.postMessage({ type: 'init' });
    this.worker.addEventListener('message', (event) => {
      if (event.data?.type === 'ready') {
        this.ready = true;
        this.flush();
      }
    });
  }

  enqueue(request: WorkerRequest) {
    this.queue.push(request);
    this.flush();
  }

  private flush() {
    if (!this.worker || !this.ready) return;
    while (this.queue.length) {
      this.worker.postMessage(this.queue.shift());
    }
  }
}
