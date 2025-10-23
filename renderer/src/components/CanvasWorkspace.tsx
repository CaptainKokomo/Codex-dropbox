import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';
import { nanoid } from 'nanoid/non-secure';
import type { CircuitComponent, WireConnection } from '@state/types';
import { useNodeLabStore, selectActiveProject } from '@state/store';
import { clsx } from 'clsx';

export function CanvasWorkspace() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pendingTerminal, setPendingTerminal] = useState<{ componentId: string; terminalId: string } | null>(null);

  const {
    components,
    wires,
    addComponent,
    updateComponent,
    addWire,
    selectedComponentId,
    setSelectedComponent
  } = useNodeLabStore((state) => {
    const project = selectActiveProject(state);
    return {
      components: project?.components ?? [],
      wires: project?.wires ?? [],
      addComponent: state.addComponent,
      updateComponent: state.updateComponent,
      addWire: state.addWire,
      selectedComponentId: state.selectedComponentId,
      setSelectedComponent: state.setSelectedComponent
    };
  });

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const data = event.dataTransfer.getData('text/component');
      if (!data) return;

      const template = JSON.parse(data) as CircuitComponent;
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      const offsetX = canvasBounds ? event.clientX - canvasBounds.left : 0;
      const offsetY = canvasBounds ? event.clientY - canvasBounds.top : 0;
      const position = snapToGrid({ x: offsetX, y: offsetY });

      const freshComponent: CircuitComponent = {
        ...template,
        id: nanoid(),
        position,
        rotation: 0,
        terminals: template.terminals.map((terminal) => ({ ...terminal, id: `${terminal.id}-${nanoid(4)}` }))
      };

      addComponent(freshComponent);
    },
    [addComponent]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('text/component')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const startWire = useCallback(
    (componentId: string, terminalId: string) => {
      if (!pendingTerminal) {
        setPendingTerminal({ componentId, terminalId });
        return;
      }

      if (pendingTerminal.componentId === componentId && pendingTerminal.terminalId === terminalId) {
        setPendingTerminal(null);
        return;
      }

      const newWire: WireConnection = {
        id: nanoid(),
        from: pendingTerminal,
        to: { componentId, terminalId },
        path: []
      };
      addWire(newWire);
      setPendingTerminal(null);
    },
    [addWire, pendingTerminal]
  );

  const handleDrag = useCallback(
    (event: DragEvent<HTMLDivElement>, component: CircuitComponent) => {
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      if (!canvasBounds) return;
      const offsetX = event.clientX - canvasBounds.left;
      const offsetY = event.clientY - canvasBounds.top;
      const position = snapToGrid({ x: offsetX, y: offsetY });
      updateComponent(component.id, { position });
    },
    [updateComponent]
  );

  const wiresToRender = useMemo(() => wires, [wires]);

  return (
    <section className="canvas-workspace">
      <div
        className="canvas-grid"
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={(event) => {
          if (event.currentTarget === event.target) {
            setSelectedComponent(null);
          }
        }}
      >
        <svg className="canvas-wires" width="100%" height="100%">
          {wiresToRender.map((wire) => {
            const fromComponent = components.find((component) => component.id === wire.from.componentId);
            const toComponent = components.find((component) => component.id === wire.to.componentId);
            if (!fromComponent || !toComponent) return null;
            const fromTerminal = fromComponent.terminals.find((terminal) => terminal.id === wire.from.terminalId);
            const toTerminal = toComponent.terminals.find((terminal) => terminal.id === wire.to.terminalId);
            if (!fromTerminal || !toTerminal) return null;

            const startX = (fromComponent.position?.x ?? 0) + fromTerminal.position.x;
            const startY = (fromComponent.position?.y ?? 0) + fromTerminal.position.y;
            const endX = (toComponent.position?.x ?? 0) + toTerminal.position.x;
            const endY = (toComponent.position?.y ?? 0) + toTerminal.position.y;

            return (
              <line
                key={wire.id}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                className={clsx('wire-line', {
                  'wire-active': pendingTerminal?.componentId === wire.to.componentId,
                  'wire-pending': pendingTerminal?.componentId === wire.from.componentId
                })}
              />
            );
          })}
        </svg>
        {components.map((component) => (
          <div
            key={component.id}
            className={clsx('canvas-component', selectedComponentId === component.id && 'selected')}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', component.id);
              event.dataTransfer.effectAllowed = 'move';
            }}
            onDrag={(event) => handleDrag(event, component)}
            onDragEnd={(event) => handleDrag(event, component)}
            onClick={() => setSelectedComponent(component.id)}
            style={{
              left: (component.position?.x ?? 0) - 48,
              top: (component.position?.y ?? 0) - 24
            }}
          >
            <header className="component-head">
              <span>{component.name}</span>
            </header>
            <div className="component-body">
              {component.terminals.map((terminal) => (
                <button
                  key={terminal.id}
                  className={clsx('terminal-dot', terminal.polarity)}
                  onClick={(event) => {
                    event.stopPropagation();
                    startWire(component.id, terminal.id);
                  }}
                  title={`${terminal.label} (${terminal.polarity})`}
                  style={{
                    left: 48 + terminal.position.x,
                    top: 24 + terminal.position.y
                  }}
                >
                  {terminal.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {pendingTerminal && <div className="wire-preview">Connect to another terminal…</div>}
      </div>
    </section>
  );
}

function snapToGrid(position: { x: number; y: number }) {
  const gridSize = 16;
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
}
