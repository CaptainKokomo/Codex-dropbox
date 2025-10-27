import type { ComponentInstance, NodeAnchor, Wire } from '../state/circuitTypes';

export const GRID_SIZE = 20;

export const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

export const snapPosition = (position: { x: number; y: number }) => ({
  x: snapToGrid(position.x),
  y: snapToGrid(position.y)
});

export const getNodeWorldPosition = (component: ComponentInstance, node: NodeAnchor) => ({
  x: component.position.x + node.position.x,
  y: component.position.y + node.position.y
});

export const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const findNodeAtPoint = (
  components: ComponentInstance[],
  point: { x: number; y: number },
  radius = 16
) => {
  for (const component of components) {
    for (const node of component.nodes) {
      const world = getNodeWorldPosition(component, node);
      if (distance(world, point) <= radius) {
        return { component, node };
      }
    }
  }
  return undefined;
};

export const findComponentAtPoint = (
  components: ComponentInstance[],
  point: { x: number; y: number }
) => {
  return components.find((component) => {
    const width = 80;
    const height = 40;
    return (
      point.x >= component.position.x - width / 2 &&
      point.x <= component.position.x + width / 2 &&
      point.y >= component.position.y - height / 2 &&
      point.y <= component.position.y + height / 2
    );
  });
};

export const findWireAtPoint = (wires: Wire[], point: { x: number; y: number }, components: ComponentInstance[]) => {
  const tolerance = 12;
  for (const wire of wires) {
    const startComponent = components.find((component) => component.id === wire.from.componentId);
    const endComponent = components.find((component) => component.id === wire.to.componentId);
    if (!startComponent || !endComponent) continue;
    const startNode = startComponent.nodes.find((node) => node.id === wire.from.nodeId);
    const endNode = endComponent.nodes.find((node) => node.id === wire.to.nodeId);
    if (!startNode || !endNode) continue;
    const startPos = getNodeWorldPosition(startComponent, startNode);
    const endPos = getNodeWorldPosition(endComponent, endNode);

    const dist = pointToSegmentDistance(point, startPos, endPos);
    if (dist <= tolerance) {
      return wire;
    }
  }
  return undefined;
};

const pointToSegmentDistance = (
  point: { x: number; y: number },
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    return distance(point, start);
  }
  const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));
  const closest = {
    x: start.x + clampedT * dx,
    y: start.y + clampedT * dy
  };
  return distance(point, closest);
};
