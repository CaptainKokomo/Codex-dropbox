import React from 'react';
import { useAppStore } from '../state/appStore';

export const InspectorPanel: React.FC = () => {
  const activeComponentId = useAppStore((state) => state.activeComponentId);
  const components = useAppStore((state) => state.components);
  const updateComponent = useAppStore((state) => state.updateComponent);

  const activeComponent = components.find((component) => component.runtimeId === activeComponentId);

  if (!activeComponent) {
    return (
      <aside style={{ background: '#161b27', padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
        <h2>Details</h2>
        <p>Select a component to view and edit its properties.</p>
      </aside>
    );
  }

  return (
    <aside style={{ background: '#161b27', padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
      <h2 style={{ marginTop: 0 }}>{activeComponent.name}</h2>
      {activeComponent.editableFields.map((field) => (
        <label key={field.key} style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{field.label}</span>
          <input
            type="number"
            value={Number(activeComponent.defaultValues[field.key])}
            min={field.min}
            max={field.max}
            onChange={(event) =>
              updateComponent(activeComponent.runtimeId!, {
                defaultValues: {
                  ...activeComponent.defaultValues,
                  [field.key]: Number(event.target.value)
                }
              } as any)
            }
          />
        </label>
      ))}
    </aside>
  );
};
