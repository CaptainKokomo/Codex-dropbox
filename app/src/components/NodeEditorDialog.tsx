import { useCanvas } from '../state/canvasStore';
import { useState, useEffect } from 'react';

export const NodeEditorDialog = () => {
  const { nodeEditor, updateNodeLabel, closeNodeEditor, components } = useCanvas();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!nodeEditor) return;
    const component = components.find((item) => item.id === nodeEditor.componentId);
    const node = component?.nodes.find((item) => item.id === nodeEditor.nodeId);
    if (node) {
      setValue(node.label);
    }
  }, [components, nodeEditor]);

  if (!nodeEditor) return null;

  const component = components.find((item) => item.id === nodeEditor.componentId);
  const node = component?.nodes.find((item) => item.id === nodeEditor.nodeId);
  if (!node) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Edit node label"
    >
      <div className="w-80 rounded-lg bg-panel p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-100">Edit Node</h3>
        <p className="mt-1 text-sm text-slate-400">Update the label that appears next to this pin.</p>
        <input
          className="mt-4 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={closeNodeEditor}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              updateNodeLabel(nodeEditor.componentId, nodeEditor.nodeId, value);
              closeNodeEditor();
            }}
            className="rounded-md bg-accent/20 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/30"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
