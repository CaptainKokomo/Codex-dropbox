import { useCanvas } from '../state/canvasStore';
import { useUI } from '../state/uiStore';

interface InspectorPanelProps {
  beginnerMode: boolean;
}

export const InspectorPanel = ({ beginnerMode }: InspectorPanelProps) => {
  const { selectedComponent, updateComponentValue, openNodeEditor } = useCanvas();
  const { languageStyle } = useUI();

  if (!selectedComponent) {
    return (
      <aside
        className="w-80 border-l border-slate-800 bg-panel px-4 py-6"
        aria-label="Inspector"
      >
        <p className="text-sm text-slate-400">Select a part to view its details.</p>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-slate-800 bg-panel px-4 py-6" aria-label="Inspector">
      <h2 className="text-lg font-semibold text-slate-100">{selectedComponent.label}</h2>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
        {languageStyle === 'simple' ? selectedComponent.simpleDescription : selectedComponent.detailedDescription}
      </p>
      <div className="mt-4 space-y-4">
        {selectedComponent.values.map((value) => (
          <label key={value.id} className="flex flex-col text-sm text-slate-200">
            <span className="mb-1 text-xs font-semibold uppercase text-slate-400">{value.label}</span>
            <input
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              value={value.value}
              onChange={(event) => updateComponentValue(selectedComponent.id, value.id, event.target.value)}
            />
            {value.hint && beginnerMode && <span className="mt-1 text-xs text-slate-500">{value.hint}</span>}
          </label>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <h3 className="text-xs font-semibold uppercase text-slate-400">Nodes</h3>
        {selectedComponent.nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => openNodeEditor(selectedComponent.id, node.id)}
            className="flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm hover:border-accent"
          >
            <span>{node.label}</span>
            <span className="text-xs text-slate-500">{node.hint}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
