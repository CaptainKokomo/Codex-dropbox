import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';
import { ComponentBlueprint, ComponentNode, ComponentValue } from '../data/components';
import { produce } from 'use-immer';

export type Point = { x: number; y: number };

export type CanvasNode = ComponentNode & { componentId: string };

export type CanvasComponent = {
  id: string;
  type: string;
  label: string;
  simpleDescription: string;
  detailedDescription: string;
  dimensions: { width: number; height: number };
  position: Point;
  nodes: CanvasNode[];
  values: ComponentValue[];
  selected: boolean;
};

export type Wire = {
  id: string;
  from: { componentId: string; nodeId: string };
  to: { componentId: string; nodeId: string };
  points: Point[];
  highlighted?: boolean;
};

type DragState = {
  active: boolean;
  start?: Point;
  preview?: Point[];
  from?: { componentId: string; nodeId: string };
};

type NodeEditorState = {
  componentId: string;
  nodeId: string;
};

type CanvasState = {
  components: CanvasComponent[];
  wires: Wire[];
  dragState?: DragState;
  hoverNodeId?: string;
  nodeEditor?: NodeEditorState;
  selectedComponent?: CanvasComponent;
  addComponentTemplate: (template: ComponentBlueprint) => void;
  selectComponent: (id: string | undefined) => void;
  updateComponentValue: (componentId: string, valueId: string, value: string) => void;
  beginWireDrag: (componentId: string, nodeId: string) => void;
  updateWirePreview: (point: Point) => void;
  completeWireDrag: (componentId: string, nodeId: string) => void;
  cancelWireDrag: () => void;
  setHoverNode: (nodeId: string | undefined) => void;
  translateComponent: (componentId: string, x: number, y: number) => void;
  openNodeEditor: (componentId: string, nodeId: string) => void;
  closeNodeEditor: () => void;
  updateNodeLabel: (componentId: string, nodeId: string, label: string) => void;
  rightClickWire: (wireId: string) => void;
  rightClickNode: (componentId: string, nodeId: string) => void;
};

const snapToGrid = (value: number, grid = 24) => Math.round(value / grid) * grid;

export const useCanvas = create<CanvasState>((set, get) => ({
  components: [],
  wires: [],
  dragState: undefined,
  hoverNodeId: undefined,
  nodeEditor: undefined,
  selectedComponent: undefined,
  addComponentTemplate: (template) =>
    set((state) => {
      const id = nanoid();
      const position = { x: 200 + state.components.length * 30, y: 180 + state.components.length * 30 };
      const component: CanvasComponent = {
        id,
        type: template.type,
        label: template.label,
        simpleDescription: template.simpleDescription,
        detailedDescription: template.detailedDescription,
        dimensions: template.dimensions,
        position,
        nodes: template.nodes.map((node) => ({ ...node, componentId: id })),
        values: template.values.map((value) => ({ ...value })),
        selected: false,
      };
      return {
        components: state.components.map((existing) => ({ ...existing, selected: false })).concat({
          ...component,
          selected: true,
        }),
        selectedComponent: { ...component, selected: true },
      } as Partial<CanvasState> & Pick<CanvasState, 'components'>;
    }),
  selectComponent: (id) =>
    set((state) => {
      const components = state.components.map((component) => ({
        ...component,
        selected: component.id === id,
      }));
      return {
        components,
        selectedComponent: components.find((component) => component.id === id),
      };
    }),
  updateComponentValue: (componentId, valueId, value) =>
    set(
      produce<CanvasState>((draft) => {
        const component = draft.components.find((item) => item.id === componentId);
        if (!component) return;
        const targetValue = component.values.find((item) => item.id === valueId);
        if (targetValue) {
          targetValue.value = value;
        }
        if (draft.selectedComponent?.id === componentId) {
          draft.selectedComponent = { ...component };
        }
      }),
    ),
  beginWireDrag: (componentId, nodeId) => {
    const component = get().components.find((item) => item.id === componentId);
    const node = component?.nodes.find((item) => item.id === nodeId);
    if (!component || !node) return;
    const start = {
      x: snapToGrid(component.position.x + node.position.x),
      y: snapToGrid(component.position.y + node.position.y),
    };
    set({
      dragState: {
        active: true,
        start,
        preview: [start],
        from: { componentId, nodeId },
      },
    });
  },
  updateWirePreview: (point) =>
    set(
      produce<CanvasState>((draft) => {
        if (!draft.dragState?.active || !draft.dragState.start) return;
        const snapped = { x: snapToGrid(point.x), y: snapToGrid(point.y) };
        draft.dragState.preview = [draft.dragState.start, snapped];
      }),
    ),
  completeWireDrag: (componentId, nodeId) => {
    const { dragState } = get();
    if (!dragState?.active || !dragState.start || !dragState.from) return;
    if (dragState.from.componentId === componentId && dragState.from.nodeId === nodeId) {
      set({ dragState: undefined });
      return;
    }
    const components = get().components;
    const targetComponent = components.find((item) => item.id === componentId);
    const targetNode = targetComponent?.nodes.find((item) => item.id === nodeId);
    if (!targetComponent || !targetNode) return;
    const end = {
      x: snapToGrid(targetComponent.position.x + targetNode.position.x),
      y: snapToGrid(targetComponent.position.y + targetNode.position.y),
    };
    const wire: Wire = {
      id: nanoid(),
      from: dragState.from,
      to: { componentId, nodeId },
      points: [dragState.start, end],
      highlighted: true,
    };
    set(
      produce<CanvasState>((draft) => {
        draft.wires.push(wire);
        draft.dragState = undefined;
      }),
    );
  },
  cancelWireDrag: () => set({ dragState: undefined }),
  setHoverNode: (nodeId) => set({ hoverNodeId: nodeId }),
  translateComponent: (componentId, x, y) =>
    set(
      produce<CanvasState>((draft) => {
        const component = draft.components.find((item) => item.id === componentId);
        if (!component) return;
        component.position = { x: snapToGrid(x), y: snapToGrid(y) };
      }),
    ),
  openNodeEditor: (componentId, nodeId) => set({ nodeEditor: { componentId, nodeId } }),
  closeNodeEditor: () => set({ nodeEditor: undefined }),
  updateNodeLabel: (componentId, nodeId, label) =>
    set(
      produce<CanvasState>((draft) => {
        const component = draft.components.find((item) => item.id === componentId);
        const node = component?.nodes.find((item) => item.id === nodeId);
        if (node) {
          node.label = label;
        }
      }),
    ),
  rightClickWire: (wireId) =>
    set(
      produce<CanvasState>((draft) => {
        draft.wires = draft.wires.filter((wire) => wire.id !== wireId);
      }),
    ),
  rightClickNode: (componentId, nodeId) => set({ nodeEditor: { componentId, nodeId } }),
}));
