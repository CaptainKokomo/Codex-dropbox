import { useMemo } from 'react';
import { availableComponents, useCircuitStore } from '../state/store';
import type { ComponentKind } from '../state/circuitTypes';
import './ComponentPalette.css';

const paletteOrder: ComponentKind[] = [
  'battery',
  'dc-source',
  'resistor',
  'capacitor',
  'led',
  'diode',
  'npn-transistor',
  'mosfet',
  'pushbutton',
  'potentiometer',
  'timer-555',
  'speaker'
];

export const ComponentPalette = () => {
  const addComponent = useCircuitStore((state) => state.addComponent);
  const paletteComponents = useMemo(
    () =>
      availableComponents
        .slice()
        .sort((a, b) => paletteOrder.indexOf(a.kind) - paletteOrder.indexOf(b.kind)),
    []
  );

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, kind: ComponentKind) => {
    event.dataTransfer.setData('component-kind', kind);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="panel palette">
      <header className="panel-header">Components</header>
      <div className="panel-content">
        {paletteComponents.map((component) => (
          <div
            key={component.kind}
            className="palette-item"
            draggable
            onDragStart={(event) => handleDragStart(event, component.kind)}
            onDoubleClick={() => addComponent(component.kind, { x: 120, y: 120 })}
          >
            <div className="item-name">{component.label}</div>
            <div className="item-description">{component.description}</div>
          </div>
        ))}
      </div>
    </aside>
  );
};
