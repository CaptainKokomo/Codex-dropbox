import { useMemo } from 'react';
import type { CircuitComponent } from '@state/types';
import { selectActiveProject, useNodeLabStore } from '@state/store';

export function InspectorPanel() {
  const { selectedComponent, updateComponent, removeComponent, advancedMode } = useNodeLabStore((state) => {
    const project = selectActiveProject(state);
    const component = project?.components.find((item) => item.id === state.selectedComponentId) ?? null;
    return {
      selectedComponent: component,
      updateComponent: state.updateComponent,
      removeComponent: state.removeComponent,
      advancedMode: state.advancedMode
    };
  });

  const inspectorContent = useMemo(() => {
    if (!selectedComponent) {
      return (
        <div className="inspector-empty">
          <h3>No part selected</h3>
          <p>Click a component on the canvas to tweak its values and see live tips.</p>
        </div>
      );
    }

    return <ComponentInspector component={selectedComponent} onUpdate={updateComponent} onRemove={removeComponent} advancedMode={advancedMode} />;
  }, [selectedComponent, updateComponent, removeComponent, advancedMode]);

  return <aside className="inspector-panel">{inspectorContent}</aside>;
}

interface ComponentInspectorProps {
  component: CircuitComponent;
  onUpdate: (componentId: string, updates: Partial<CircuitComponent>) => void;
  onRemove: (componentId: string) => void;
  advancedMode: boolean;
}

function ComponentInspector({ component, onUpdate, onRemove, advancedMode }: ComponentInspectorProps) {
  return (
    <div className="inspector-content">
      <header className="inspector-header">
        <h3>{component.name}</h3>
        <button className="inspector-remove" onClick={() => onRemove(component.id)}>
          Remove
        </button>
      </header>
      <p className="inspector-description">{component.description}</p>
      {component.editableValues?.map((editable) => (
        <label key={editable.key} className="inspector-field">
          <span>{editable.label}</span>
          <input
            type="range"
            min={editable.min}
            max={editable.max}
            step={editable.step}
            value={(component.metadata?.[editable.key] as number | undefined) ?? editable.defaultValue}
            onChange={(event) => {
              onUpdate(component.id, {
                metadata: {
                  ...component.metadata,
                  [editable.key]: Number(event.target.value)
                },
                value: `${event.target.value} ${editable.unit ?? ''}`.trim()
              });
            }}
          />
          <span className="inspector-value">
            {(component.metadata?.[editable.key] as number | undefined) ?? editable.defaultValue}{' '}
            {editable.unit ?? ''}
          </span>
        </label>
      ))}
      {component.metadata && (
        <section className="inspector-meta">
          <h4>Details</h4>
          <ul>
            {Object.entries(component.metadata).map(([key, value]) => (
              <li key={key}>
                <strong>{formatKey(key)}:</strong> {String(value)}
              </li>
            ))}
          </ul>
        </section>
      )}
      {advancedMode && (
        <section className="inspector-advanced">
          <h4>Advanced controls</h4>
          <button
            className="inspector-action"
            onClick={() => onUpdate(component.id, { rotation: ((component.rotation ?? 0) + 90) % 360 })}
          >
            Rotate 90°
          </button>
          <button
            className="inspector-action"
            onClick={() => onUpdate(component.id, { metadata: { ...component.metadata, custom: true } })}
          >
            Mark as custom
          </button>
        </section>
      )}
    </div>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/^\w/, (char) => char.toUpperCase());
}
