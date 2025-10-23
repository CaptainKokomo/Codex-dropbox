import { useMemo } from 'react';
import { useSimulationRunner } from '@hooks/useSimulation';

export function InstrumentationStrip() {
  const { simulation, diagnostics } = useSimulationRunner();

  const topNodes = useMemo(() => {
    if (!simulation) return [];
    return Object.entries(simulation.nodes)
      .slice(0, 4)
      .map(([node, readings]) => ({ node, ...readings }));
  }, [simulation]);

  return (
    <footer className="instrumentation-strip">
      <div className="instrument-block">
        <h4>Multimeter</h4>
        {topNodes.length === 0 && <p>Place probes by selecting a wire on the canvas.</p>}
        <ul>
          {topNodes.map((reading) => (
            <li key={reading.node}>
              <strong>{reading.node}</strong>: {reading.voltage.toFixed(2)} V / {reading.current.toFixed(3)} A
            </li>
          ))}
        </ul>
      </div>
      <div className="instrument-block">
        <h4>Scope</h4>
        {simulation ? (
          <div className="scope-display">
            <span className="scope-frequency">~{(simulation.metadata?.frequency as number | undefined)?.toFixed(2) ?? '0.00'} Hz</span>
            <div className="scope-waveform" aria-hidden />
          </div>
        ) : (
          <p>Run the sim to see live waveforms.</p>
        )}
      </div>
      <div className="instrument-block">
        <h4>Coaching</h4>
        {diagnostics.length === 0 ? (
          <p>Looking good! Try dropping a prefab kit to explore more.</p>
        ) : (
          <ul>
            {diagnostics.map((message) => (
              <li key={message.id} className={`diag-${message.severity}`}>
                <strong>{message.title}</strong>
                <span>{message.description}</span>
                {message.hint && <em>{message.hint}</em>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
