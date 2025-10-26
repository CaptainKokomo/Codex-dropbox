import { useEffect, useRef } from 'react';
import { useCircuitStore } from '../state/store';

export const SimulationBridge = () => {
  const components = useCircuitStore((state) => state.components);
  const wires = useCircuitStore((state) => state.wires);
  const status = useCircuitStore((state) => state.simulation.status);
  const registerReadings = useCircuitStore((state) => state.registerSimulationReadings);
  const addCoaching = useCircuitStore((state) => state.addCoachingMessage);
  const setSimulationStatus = useCircuitStore((state) => state.setSimulationStatus);

  const workerRef = useRef<Worker | null>(null);
  const lastWarningsRef = useRef<string[]>([]);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/simulationWorker.ts', import.meta.url), {
      type: 'module'
    });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<{ readings: any[]; warnings: string[] }>) => {
      registerReadings(event.data.readings);
      const freshWarnings = event.data.warnings.filter(
        (warning) => !lastWarningsRef.current.includes(warning)
      );
      freshWarnings.forEach((warning) => addCoaching(warning, 'warning'));
      lastWarningsRef.current = event.data.warnings;
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
      lastWarningsRef.current = [];
    };
  }, [registerReadings, addCoaching]);

  useEffect(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ components, wires, status });
  }, [components, wires, status]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setSimulationStatus('paused');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [setSimulationStatus]);

  return null;
};
