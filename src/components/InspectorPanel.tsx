import { useEffect, useState } from 'react';
import { useCircuitStore } from '../state/store';
import type { ComponentInstance } from '../state/circuitTypes';
import './InspectorPanel.css';

export const InspectorPanel = () => {
  const selectedComponentId = useCircuitStore((state) => state.selectedComponentId);
  const components = useCircuitStore((state) => state.components);
  const updateSettings = useCircuitStore((state) => state.updateSettings);
  const settings = useCircuitStore((state) => state.settings);
  const setSimulationStatus = useCircuitStore((state) => state.setSimulationStatus);
  const updateComponentValue = useCircuitStore((state) => state.updateComponentValue);
  const openValueEditor = useCircuitStore((state) => state.openValueEditor);
  const closeValueEditor = useCircuitStore((state) => state.closeValueEditor);
  const valueEditorComponentId = useCircuitStore((state) => state.ui.valueEditorComponentId);

  const component = components.find((item) => item.id === selectedComponentId);
  const [editing, setEditing] = useState(false);
  const [valueInput, setValueInput] = useState(component?.value ?? '');

  useEffect(() => {
    const shouldEdit = component?.id && component.id === valueEditorComponentId;
    setEditing(Boolean(shouldEdit));
    setValueInput(component?.value ?? '');
    if (!shouldEdit && valueEditorComponentId) {
      closeValueEditor();
    }
  }, [component?.id, component?.value, valueEditorComponentId, closeValueEditor]);

  const handleValueSave = () => {
    if (!component) return;
    updateComponentValue(component.id, valueInput);
    setEditing(false);
    closeValueEditor();
    useCircuitStore.getState().addCoachingMessage(`${component.name} set to ${valueInput}.`, 'info');
  };

  const renderDetails = (item: ComponentInstance) => (
    <div className="inspector-details" key={item.id}>
      <div className="inspector-field">
        <span className="label">Name</span>
        <span>{item.name}</span>
      </div>
      <div className="inspector-field">
        <span className="label">Value</span>
        {editing ? (
          <div className="value-editor">
            <input value={valueInput} onChange={(event) => setValueInput(event.target.value)} />
            <button onClick={handleValueSave}>Save</button>
          </div>
        ) : (
          <span
            className="editable"
            onContextMenu={(event) => {
              event.preventDefault();
              if (component) {
                openValueEditor(component.id);
              }
            }}
          >
            {item.value}
          </span>
        )}
      </div>
      <div className="inspector-field">
        <span className="label">Rotation</span>
        <span>{item.rotation}°</span>
      </div>
      <div className="inspector-nodes">
        {item.nodes.map((node) => (
          <div key={node.id} className="node-chip">
            <span>{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="panel inspector">
      <header className="panel-header">Details</header>
      <div className="panel-content">
        {!component && <div className="placeholder">Select a part to edit its settings.</div>}
        {component && renderDetails(component)}
        <div className="inspector-settings">
          <h4>Workspace</h4>
          <label>
            <input
              type="checkbox"
              checked={settings.simpleLanguage}
              onChange={(event) => updateSettings({ simpleLanguage: event.target.checked })}
            />
            Simple language
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.showTips}
              onChange={(event) => updateSettings({ showTips: event.target.checked })}
            />
            Show tips
          </label>
          <button
            onClick={() => {
              setSimulationStatus('idle');
              useCircuitStore.getState().addCoachingMessage('Tutorial reset.', 'info');
            }}
          >
            Reset tutorial tips
          </button>
        </div>
      </div>
    </aside>
  );
};
