import { useCallback } from 'react';
import { useNodeLabStore } from '@state/store';
import { runRealtimeSimulation } from '@utils/simulation';

export function useSimulationRunner() {
  const {
    simulation,
    setSimulation,
    setDiagnostics,
    advancedMode,
    diagnostics
  } = useNodeLabStore((state) => ({
    simulation: state.simulation,
    diagnostics: state.diagnostics,
    setSimulation: state.setSimulation,
    setDiagnostics: state.setDiagnostics,
    advancedMode: state.advancedMode
  }));

  const runSimulation = useCallback(() => {
    const project = useNodeLabStore.getState().projects.find((p) => p.id === useNodeLabStore.getState().activeProjectId) ??
      useNodeLabStore.getState().projects[0];
    if (!project) {
      return;
    }

    const result = runRealtimeSimulation({
      components: project.components,
      wires: project.wires,
      advancedMode
    });

    setSimulation(result);
    setDiagnostics(result.diagnostics);
  }, [advancedMode, setDiagnostics, setSimulation]);

  const stopSimulation = useCallback(() => {
    setSimulation(null);
  }, [setSimulation]);

  return {
    simulation,
    diagnostics,
    runSimulation,
    stopSimulation
  };
}
