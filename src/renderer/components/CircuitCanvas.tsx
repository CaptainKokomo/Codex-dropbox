import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../state/appStore';
import { PixiRendererAdapter } from '../utils/PixiRendererAdapter';

const adapter = new PixiRendererAdapter();

export const CircuitCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const components = useAppStore((state) => state.components);
  const connections = useAppStore((state) => state.connections);
  const removeConnection = useAppStore((state) => state.removeConnection);
  const updateComponent = useAppStore((state) => state.updateComponent);
  const simulation = useAppStore((state) => state.simulation);
  const registerConnection = useAppStore((state) => state.registerConnection);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      adapter.mount({ container });
      adapter.onContextMenu((event) => {
        if (event.type === 'wire') {
          removeConnection(event.id);
        }
      });
      adapter.onNodeEdit((componentId, nodeId) => {
        const component = useAppStore.getState().components.find((item) => item.runtimeId === componentId);
        if (!component) return;
        const field = component.editableFields[0];
        if (!field) return;
        const currentValue = component.defaultValues[field.key];
        const promptLabel = `Set ${field.label} for ${component.name}`;
        const result = window.prompt(promptLabel, String(currentValue ?? ''));
        if (result === null) return;
        const nextValue = field.type === 'number' ? Number(result) : result;
        updateComponent(component.runtimeId!, {
          defaultValues: {
            ...component.defaultValues,
            [field.key]: nextValue
          }
        } as any);
      });
      adapter.onWireComplete?.((from, to) => {
        registerConnection(from, to);
      });
      adapter.onWirePreview?.((componentId, nodeId) => {
        if (nodeId) {
          adapter.highlightNode(componentId, nodeId);
        } else {
          adapter.highlightNode('', '');
        }
      });
    }
    return () => adapter.unmount();
  }, [registerConnection, removeConnection, updateComponent]);

  useEffect(() => {
    const seen = new Set<string>();
    components.forEach((component) => {
      if (!component.runtimeId) return;
      seen.add(component.runtimeId);
      adapter.addComponentInstance(component);
    });
    adapter.cleanupComponents?.(seen);
  }, [components]);

  useEffect(() => {
    const seen = new Set<string>();
    connections.forEach((connection) => {
      seen.add(connection.id);
      adapter.setConnection(connection);
    });
    adapter.cleanupConnections?.(seen);
  }, [connections]);

  useEffect(() => {
    if (simulation) {
      adapter.updateSimulation(simulation);
    }
  }, [simulation]);

  return <div ref={containerRef} style={{ position: 'relative', background: '#0f1115' }} />;
};
