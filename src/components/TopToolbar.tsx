import { useMemo } from 'react';
import classNames from 'classnames';
import { useCircuitStore } from '../state/store';
import './TopToolbar.css';

export const TopToolbar = () => {
  const simulationStatus = useCircuitStore((state) => state.simulation.status);
  const setSimulationStatus = useCircuitStore((state) => state.setSimulationStatus);
  const undo = useCircuitStore((state) => state.undo);
  const redo = useCircuitStore((state) => state.redo);
  const clearCoaching = useCircuitStore((state) => state.clearCoaching);
  const openSettings = useCircuitStore((state) => state.openSettings);

  const runLabel = useMemo(() => {
    if (simulationStatus === 'running') return 'Pause';
    if (simulationStatus === 'paused') return 'Resume';
    return 'Run';
  }, [simulationStatus]);

  const handleRunToggle = () => {
    if (simulationStatus === 'running') {
      setSimulationStatus('paused');
    } else {
      setSimulationStatus('running');
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className={classNames('primary')} onClick={handleRunToggle}>
          {runLabel}
        </button>
        <button onClick={() => setSimulationStatus('idle')}>Reset</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>
      <div className="toolbar-group">
        <button onClick={clearCoaching}>Clear Tips</button>
        <button
          onClick={() => {
            window.electronAPI.chooseProjectFolder();
          }}
        >
          Save To…
        </button>
        <button onClick={openSettings}>
          Settings
        </button>
      </div>
    </div>
  );
};
