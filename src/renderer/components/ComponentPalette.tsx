import React from 'react';
import { availableComponents, useAppStore } from '../state/appStore';

export const ComponentPalette: React.FC = () => {
  const addComponent = useAppStore((state) => state.addComponent);

  return (
    <aside
      style={{
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: '1rem',
        overflowY: 'auto',
        background: '#121620'
      }}
    >
      <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Components</h2>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {availableComponents.map((component) => (
          <button
            key={component.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.25rem',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              background: '#1b2130',
              border: '1px solid rgba(255,255,255,0.05)',
              cursor: 'grab'
            }}
            onClick={() => addComponent(component, { x: 400, y: 300 })}
          >
            <span style={{ fontWeight: 600 }}>{component.name}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{component.description}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
