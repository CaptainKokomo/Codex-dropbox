import { Stage, Layer, Line, Circle, Group, Text, Rect } from 'react-konva';
import { useCallback, useMemo } from 'react';
import { useCanvas } from '../state/canvasStore';
import { useSimulation } from '../state/simulationStore';
import { useUI } from '../state/uiStore';
import { useHotkeys } from '../hooks/useHotkeys';

const GRID_SIZE = 24;

export const CanvasWorkspace = () => {
  const {
    components,
    wires,
    dragState,
    hoverNodeId,
    selectComponent,
    beginWireDrag,
    updateWirePreview,
    completeWireDrag,
    cancelWireDrag,
    setHoverNode,
    translateComponent,
    rightClickWire,
    rightClickNode,
  } = useCanvas();
  const { overlays } = useSimulation();
  const { showExplanations } = useUI();

  useHotkeys({
    Escape: cancelWireDrag,
  });

  const handleStageMouseMove = useCallback(
    (evt: any) => {
      if (!dragState?.active) return;
      const stage = evt.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      if (!pointerPosition) return;
      updateWirePreview(pointerPosition);
    },
    [dragState?.active, updateWirePreview],
  );

  const handleStageClick = useCallback(
    (evt: any) => {
      const targetName = evt.target?.name?.();
      if (targetName !== 'node') {
        selectComponent(undefined);
      }
    },
    [selectComponent],
  );

  const gridLines = useMemo(() => {
    const size = 6000;
    const lines = [] as JSX.Element[];
    for (let i = 0; i < size / GRID_SIZE; i += 1) {
      const pos = i * GRID_SIZE;
      lines.push(
        <Line key={`v-${i}`} points={[pos, 0, pos, size]} stroke="#1f2937" strokeWidth={1} />,
      );
      lines.push(
        <Line key={`h-${i}`} points={[0, pos, size, pos]} stroke="#1f2937" strokeWidth={1} />,
      );
    }
    return lines;
  }, []);

  return (
    <div className="relative flex-1 bg-canvas">
      <Stage
        width={window.innerWidth - 480}
        height={window.innerHeight - 200}
        onMouseMove={handleStageMouseMove}
        onClick={handleStageClick}
        onContextMenu={(evt) => {
          evt.evt.preventDefault();
          cancelWireDrag();
        }}
        className="outline-none"
        tabIndex={0}
        role="application"
        aria-label="Circuit canvas"
      >
        <Layer>{gridLines}</Layer>
        <Layer>
          {wires.map((wire) => (
            <Line
              key={wire.id}
              points={wire.points.flatMap((point) => [point.x, point.y])}
              stroke={wire.highlighted ? '#5C9DFF' : '#94a3b8'}
              strokeWidth={3}
              hitStrokeWidth={12}
              lineCap="round"
              lineJoin="round"
              name="wire"
              onContextMenu={(evt) => {
                evt.evt.preventDefault();
                rightClickWire(wire.id);
              }}
            />
          ))}
          {dragState?.active && dragState.preview && (
            <Line
              points={dragState.preview.flatMap((point) => [point.x, point.y])}
              stroke="#5C9DFF"
              strokeWidth={2}
              dash={[8, 4]}
            />
          )}
        </Layer>
        <Layer>
          {components.map((component) => (
            <Group
              key={component.id}
              x={component.position.x}
              y={component.position.y}
              draggable
              onDragEnd={(evt) => {
                translateComponent(component.id, evt.target.x(), evt.target.y());
              }}
              onClick={() => selectComponent(component.id)}
              onTap={() => selectComponent(component.id)}
              name="component"
            >
              <Rect
                width={component.dimensions.width}
                height={component.dimensions.height}
                fill={component.selected ? '#1f2937' : '#111827'}
                stroke={component.selected ? '#5C9DFF' : '#4b5563'}
                strokeWidth={2}
                cornerRadius={8}
                shadowColor={component.selected ? '#5C9DFF' : '#000'}
                shadowBlur={component.selected ? 12 : 4}
              />
              <Text text={component.label} fontSize={14} fill="#f8fafc" x={12} y={12} />
              {component.nodes.map((node) => {
                const isStartNode =
                  dragState?.from?.componentId === component.id && dragState.from.nodeId === node.id;
                const isHover = hoverNodeId === node.id;
                return (
                  <Group key={node.id} x={node.position.x} y={node.position.y}>
                    <Circle
                      radius={8}
                      fill={isStartNode || isHover ? '#5C9DFF' : '#0f172a'}
                      stroke="#cbd5f5"
                      strokeWidth={1}
                      name="node"
                      onMouseEnter={() => setHoverNode(node.id)}
                      onMouseLeave={() => setHoverNode(undefined)}
                      onMouseDown={() => beginWireDrag(component.id, node.id)}
                      onMouseUp={() => completeWireDrag(component.id, node.id)}
                      onContextMenu={(evt) => {
                        evt.evt.preventDefault();
                        rightClickNode(component.id, node.id);
                      }}
                    />
                    <Text text={node.label} fontSize={12} fill="#f8fafc" x={-6} y={-28} />
                    {showExplanations && node.hint && (
                      <Text text={node.hint} fontSize={10} fill="#94a3b8" x={-12} y={20} width={80} />
                    )}
                  </Group>
                );
              })}
            </Group>
          ))}
        </Layer>
        <Layer>
          {overlays.map((overlay) => (
            <Text
              key={overlay.id}
              text={overlay.text}
              x={overlay.position.x}
              y={overlay.position.y}
              fontSize={12}
              fill={overlay.type === 'warning' ? '#FFB86C' : '#6DE39C'}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
