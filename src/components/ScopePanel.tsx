import { useMemo } from 'react';
import { useCircuitStore } from '../state/store';
import './ScopePanel.css';

export const ScopePanel = () => {
  const readings = useCircuitStore((state) => state.simulation.readings);
  const status = useCircuitStore((state) => state.simulation.status);

  const summary = useMemo(() => {
    return readings.slice(0, 4).map((reading) => (
      <div key={`${reading.componentId}-${reading.nodeId}`} className="reading">
        <div className="title">{reading.nodeId}</div>
        <div className="value">{reading.voltage.toFixed(2)} V</div>
        <div className="value subtle">{reading.current.toFixed(3)} A</div>
      </div>
    ));
  }, [readings]);

  return (
    <footer className="scope-panel">
      <div className="status">Simulation: {status}</div>
      <div className="readings">{summary.length ? summary : <span>No probes yet.</span>}</div>
    </footer>
  );
};
