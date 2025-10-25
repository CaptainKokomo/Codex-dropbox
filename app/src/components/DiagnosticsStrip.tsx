import { useSimulation } from '../state/simulationStore';
import { useHotkeys } from '../hooks/useHotkeys';

export const DiagnosticsStrip = () => {
  const { multimeter, oscilloscope, errors, acknowledgeError } = useSimulation();

  useHotkeys({
    KeyZ: (event) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
        event.preventDefault();
      }
    },
  });

  return (
    <footer className="border-t border-slate-800 bg-panel px-4 py-3" aria-label="Diagnostics">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs">
          <span className="rounded bg-slate-900 px-2 py-1 text-slate-300">
            Meter: {multimeter.voltage.toFixed(2)} V / {multimeter.current.toFixed(2)} A
          </span>
          <span className="rounded bg-slate-900 px-2 py-1 text-slate-300">
            Scope A: {oscilloscope.channelA.frequency.toFixed(2)} Hz
          </span>
          <span className="rounded bg-slate-900 px-2 py-1 text-slate-300">
            Scope B: {oscilloscope.channelB.frequency.toFixed(2)} Hz
          </span>
        </div>
        <div className="flex items-center gap-2" role="status" aria-live="assertive">
          {errors.map((error) => (
            <button
              key={error.id}
              onClick={() => acknowledgeError(error.id)}
              className="rounded-md border border-warning/50 bg-warning/20 px-3 py-2 text-xs text-warning"
            >
              {error.message}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};
