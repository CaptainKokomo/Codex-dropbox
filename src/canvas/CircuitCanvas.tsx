import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useCircuitStore } from '../state/store';
import type { ComponentInstance, Wire } from '../state/circuitTypes';
import {
  GRID_SIZE,
  findComponentAtPoint,
  findNodeAtPoint,
  findWireAtPoint,
  getNodeWorldPosition,
  snapPosition
} from '../utils/geometry';
import './CircuitCanvas.css';

interface CanvasPoint {
  x: number;
  y: number;
}

const worldFromEvent = (
  event: React.PointerEvent<HTMLCanvasElement>,
  offset: { x: number; y: number },
  zoom: number
): CanvasPoint => {
  const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
  const x = (event.clientX - rect.left - offset.x) / zoom;
  const y = (event.clientY - rect.top - offset.y) / zoom;
  return { x, y };
};

export const CircuitCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState<ComponentInstance | null>(null);
  const [dragOffset, setDragOffset] = useState<CanvasPoint>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const components = useCircuitStore((state) => state.components);
  const wires = useCircuitStore((state) => state.wires);
  const zoom = useCircuitStore((state) => state.zoom);
  const offset = useCircuitStore((state) => state.offset);
  const wireDraft = useCircuitStore((state) => state.wireDraft);
  const hoveredNode = useCircuitStore((state) => state.hoveredNode);
  const selectedWireId = useCircuitStore((state) => state.selectedWireId);
  const actions = useCircuitStore((state) => ({
    updateComponentPosition: state.updateComponentPosition,
    selectComponent: state.selectComponent,
    startWire: state.startWire,
    finalizeWire: state.finalizeWire,
    updateWireDraft: state.updateWireDraft,
    cancelWire: state.cancelWire,
    setZoom: state.setZoom,
    setOffset: state.setOffset,
    setHoveredNode: state.setHoveredNode,
    deleteWire: state.deleteWire,
    showContextMenu: state.showContextMenu,
    hideContextMenu: state.hideContextMenu,
    selectWire: state.selectWire
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame: number;

    const render = () => {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(offset.x, offset.y);
      context.scale(zoom, zoom);

      drawGrid(context, width, height, zoom, offset);
      wires.forEach((wire) => drawWire(context, wire, components, wireDraft?.id === wire.id));
      if (wireDraft) {
        drawWireDraft(context, wireDraft, components);
      }
      components.forEach((component) => drawComponent(context, component, hoveredNode));

      context.restore();

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [components, wires, zoom, offset, wireDraft, hoveredNode]);

  const handleDrop = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData('component-kind') as ComponentInstance['kind'];
    if (!kind) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const point = {
      x: (clientPoint.x - offset.x) / zoom,
      y: (clientPoint.y - offset.y) / zoom
    };
    useCircuitStore.getState().addComponent(kind, snapPosition(point));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsPointerDown(true);
    (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);

    const point = worldFromEvent(event, offset, zoom);

    if (event.button === 2) {
      const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
      const menuPosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const wire = findWireAtPoint(wires, point, components);
      if (wire) {
        actions.showContextMenu({
          position: menuPosition,
          target: { type: 'wire', id: wire.id }
        });
        return;
      }
      const node = findNodeAtPoint(components, point);
      if (node) {
        actions.showContextMenu({
          position: menuPosition,
          target: {
            type: 'node',
            componentId: node.component.id,
            nodeId: node.node.id
          }
        });
        return;
      }
    }

    const nodeHit = findNodeAtPoint(components, point);
    if (nodeHit && event.button === 0) {
      const draft = useCircuitStore.getState().wireDraft;
      if (draft) {
        actions.finalizeWire({ componentId: nodeHit.component.id, nodeId: nodeHit.node.id });
      } else {
        actions.startWire({ componentId: nodeHit.component.id, nodeId: nodeHit.node.id });
      }
      return;
    }

    const wireHit = findWireAtPoint(wires, point, components);
    if (wireHit && event.button === 0) {
      actions.selectWire(wireHit.id);
      return;
    }

    const component = findComponentAtPoint(components, point);
    if (component && event.button === 0) {
      actions.selectComponent(component.id);
      setDraggedComponent(component);
      setDragOffset({ x: point.x - component.position.x, y: point.y - component.position.y });
      return;
    }

    if (event.button === 0) {
      setIsPanning(true);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown) return;
    const point = worldFromEvent(event, offset, zoom);

    if (draggedComponent) {
      const newPosition = snapPosition({
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y
      });
      actions.updateComponentPosition(draggedComponent.id, newPosition);
      return;
    }

    if (wireDraft) {
      const node = findNodeAtPoint(components, point);
      actions.updateWireDraft(point, node ? { componentId: node.component.id, nodeId: node.node.id } : undefined);
      return;
    }

    if (isPanning) {
      const deltaX = event.movementX;
      const deltaY = event.movementY;
      actions.setOffset({ x: offset.x + deltaX, y: offset.y + deltaY });
      return;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsPointerDown(false);
    setDraggedComponent(null);
    setIsPanning(false);
    if (event.button !== 2) {
      actions.hideContextMenu();
    }
    (event.target as HTMLCanvasElement).releasePointerCapture(event.pointerId);
  };

  const handlePointerLeave = () => {
    setIsPointerDown(false);
    setDraggedComponent(null);
    setIsPanning(false);
    actions.hideContextMenu();
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomDelta = -event.deltaY * 0.001;
    const nextZoom = zoom + zoomDelta;
    actions.setZoom(nextZoom);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        actions.cancelWire();
        actions.hideContextMenu();
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedWireId) {
          actions.deleteWire(selectedWireId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, selectedWireId]);

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        onContextMenu={(event) => event.preventDefault()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
      />
      <ContextMenuOverlay />
    </div>
  );
};

const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  offset: { x: number; y: number }
) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(78, 84, 118, 0.18)';
  ctx.lineWidth = 1 / zoom;
  const gridSize = GRID_SIZE;

  const startX = -offset.x / zoom;
  const startY = -offset.y / zoom;
  const endX = startX + width / zoom;
  const endY = startY + height / zoom;

  for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }
  for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
  ctx.restore();
};

const drawComponent = (
  ctx: CanvasRenderingContext2D,
  component: ComponentInstance,
  hoveredNode: { componentId: string; nodeId: string } | undefined
) => {
  const width = 96;
  const height = 52;
  ctx.save();
  ctx.translate(component.position.x, component.position.y);
  ctx.fillStyle = 'rgba(32, 36, 52, 0.92)';
  ctx.strokeStyle = 'rgba(121, 200, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  drawRoundedRect(ctx, -width / 2, -height / 2, width, height, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '12px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(component.name, 0, -height / 2 - 10);

  component.nodes.forEach((node) => {
    const position = getNodeWorldPosition(component, node);
    ctx.save();
    ctx.translate(position.x - component.position.x, position.y - component.position.y);
    const isHighlighted = hoveredNode?.componentId === component.id && hoveredNode.nodeId === node.id;
    ctx.fillStyle = isHighlighted ? 'rgba(75, 222, 255, 0.9)' : 'rgba(80, 87, 127, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0d16';
    ctx.font = '10px "Segoe UI"';
    ctx.fillText(node.label, 0, 3);
    ctx.restore();
  });

  ctx.restore();
};

const drawWire = (
  ctx: CanvasRenderingContext2D,
  wire: Wire,
  components: ComponentInstance[],
  isDraft: boolean
) => {
  const startComponent = components.find((component) => component.id === wire.from.componentId);
  const endComponent = components.find((component) => component.id === wire.to.componentId);
  if (!startComponent || !endComponent) return;
  const startNode = startComponent.nodes.find((node) => node.id === wire.from.nodeId);
  const endNode = endComponent.nodes.find((node) => node.id === wire.to.nodeId);
  if (!startNode || !endNode) return;
  const start = getNodeWorldPosition(startComponent, startNode);
  const end = getNodeWorldPosition(endComponent, endNode);

  ctx.save();
  ctx.strokeStyle = isDraft ? 'rgba(59, 209, 255, 0.6)' : 'rgba(73, 235, 150, 0.9)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const midX = (start.x + end.x) / 2;
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(midX, start.y, midX, end.y, end.x, end.y);
  ctx.stroke();
  ctx.restore();
};

const drawWireDraft = (ctx: CanvasRenderingContext2D, wire: Wire, components: ComponentInstance[]) => {
  const startComponent = components.find((component) => component.id === wire.from.componentId);
  if (!startComponent) return;
  const startNode = startComponent.nodes.find((node) => node.id === wire.from.nodeId);
  if (!startNode) return;
  const start = getNodeWorldPosition(startComponent, startNode);
  const end = wire.tempTarget ?? start;

  ctx.save();
  ctx.strokeStyle = 'rgba(59, 209, 255, 0.6)';
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  const midX = (start.x + end.x) / 2;
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(midX, start.y, midX, end.y, end.x, end.y);
  ctx.stroke();
  ctx.restore();
};

const ContextMenuOverlay = () => {
  const contextMenu = useCircuitStore((state) => state.ui.contextMenu);
  const hideContextMenu = useCircuitStore((state) => state.hideContextMenu);
  const deleteWire = useCircuitStore((state) => state.deleteWire);
  const selectComponent = useCircuitStore((state) => state.selectComponent);
  const openValueEditor = useCircuitStore((state) => state.openValueEditor);

  if (!contextMenu) return null;

  const handleDeleteWire = () => {
    if (contextMenu.target.type === 'wire') {
      deleteWire(contextMenu.target.id);
      hideContextMenu();
    }
  };

  const handleEditNode = () => {
    const target = contextMenu.target;
    if (target.type !== 'node') {
      return;
    }

    selectComponent(target.componentId);
    openValueEditor(target.componentId);

    const component = useCircuitStore
      .getState()
      .components.find((item) => item.id === target.componentId);

    if (component) {
      useCircuitStore.getState().addCoachingMessage(`Editing ${component.name}`, 'info');
    }

    hideContextMenu();
  };

  return (
    <div className={classNames('context-menu')} style={{ left: contextMenu.position.x, top: contextMenu.position.y }}>
      {contextMenu.target.type === 'wire' && <button onClick={handleDeleteWire}>Delete wire</button>}
      {contextMenu.target.type === 'node' && <button onClick={handleEditNode}>Edit value…</button>}
      <button onClick={hideContextMenu}>Cancel</button>
    </div>
  );
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};
