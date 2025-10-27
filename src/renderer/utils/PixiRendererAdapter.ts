import * as PIXI from 'pixi.js';
import { ComponentDefinition, Connection, RendererAdapter, SimulationSnapshot } from '@shared/types';

type ContextHandler = (event: { type: 'wire' | 'node'; id: string }) => void;
type NodeEditHandler = (componentId: string, nodeId: string) => void;

export class PixiRendererAdapter implements RendererAdapter {
  private app?: PIXI.Application;
  private container?: HTMLDivElement;
  private componentGraphics = new Map<string, PIXI.Container>();
  private connectionGraphics = new Map<string, PIXI.Graphics>();
  private contextHandler?: ContextHandler;
  private nodeEditHandler?: NodeEditHandler;
  private wireCompleteHandler?: (from: string, to: string) => void;
  private wirePreviewHandler?: (componentId: string, nodeId: string | null) => void;
  private wiringFrom?: { key: string; global: PIXI.Point };
  private wirePreview?: PIXI.Graphics;

  async mount({ container }: { container: HTMLDivElement }) {
    this.container = container;
    this.app = new PIXI.Application({
      background: 0x0f1115,
      antialias: true,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      resizeTo: container
    });
    await this.app.init();
    container.appendChild(this.app.canvas);
    this.setupInteractionLayer();
  }

  cleanupComponents(active: Set<string>) {
    for (const id of Array.from(this.componentGraphics.keys())) {
      if (!active.has(id)) {
        this.removeComponentInstance(id);
      }
    }
  }

  cleanupConnections(active: Set<string>) {
    for (const id of Array.from(this.connectionGraphics.keys())) {
      if (!active.has(id)) {
        this.removeConnection(id);
      }
    }
  }

  private setupInteractionLayer() {
    if (!this.app) return;
    const stage = this.app.stage;
    stage.eventMode = 'static';
    stage.hitArea = this.app.screen;
    this.wirePreview = new PIXI.Graphics();
    this.wirePreview.alpha = 0.75;
    stage.addChild(this.wirePreview);

    stage.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (!this.wiringFrom || !this.wirePreview) return;
      this.wirePreview.clear();
      this.wirePreview.stroke({ width: 3, color: 0x5ab2ff, cap: 'round' });
      this.wirePreview.moveTo(this.wiringFrom.global.x, this.wiringFrom.global.y);
      this.wirePreview.lineTo(event.global.x, event.global.y);
    });

    stage.on('pointerup', () => {
      this.cancelWire();
    });
  }

  unmount(): void {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    }
    if (this.container?.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.componentGraphics.clear();
    this.connectionGraphics.clear();
  }

  addComponentInstance(component: ComponentDefinition): void {
    if (!this.app) return;
    const key = component.runtimeId ?? component.id;
    const existing = this.componentGraphics.get(key);
    if (existing) {
      existing.position.set(component.position?.x ?? 0, component.position?.y ?? 0);
      return;
    }
    const container = new PIXI.Container();
    container.position.set(component.position?.x ?? 0, component.position?.y ?? 0);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.name = component.runtimeId ?? component.id;

    const body = new PIXI.Graphics();
    body.roundRect(-50, -30, 100, 60, 12);
    body.fill(0x1f2a3e);
    body.stroke({ width: 2, color: 0x3a4a68 });
    container.addChild(body);

    const label = new PIXI.Text({
      text: component.name,
      style: {
        fill: 0xffffff,
        fontFamily: 'Segoe UI',
        fontSize: 14,
        align: 'center'
      }
    });
    label.anchor.set(0.5);
    container.addChild(label);

    component.nodes.forEach((node, index) => {
      const nodeGraphic = new PIXI.Graphics();
      nodeGraphic.circle(0, 0, 8);
      nodeGraphic.fill(0x2f8cff);
      nodeGraphic.stroke({ width: 2, color: 0x103060 });
      nodeGraphic.position.set(node.position.x, node.position.y);
      nodeGraphic.eventMode = 'static';
      nodeGraphic.cursor = 'crosshair';
      nodeGraphic.name = `${component.runtimeId ?? component.id}:${node.id}`;
      nodeGraphic.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
        event.stopPropagation();
        if (event.button === 2) {
          this.contextHandler?.({ type: 'node', id: nodeGraphic.name });
          return;
        }
        this.beginWire(nodeGraphic.name ?? '', event.global);
      });
      nodeGraphic.on('pointerup', (event: PIXI.FederatedPointerEvent) => {
        event.stopPropagation();
        if (this.wiringFrom) {
          this.wireCompleteHandler?.(this.wiringFrom.key, nodeGraphic.name ?? '');
          this.cancelWire();
        }
      });
      nodeGraphic.on('pointerover', () => {
        const [componentId, nodeId] = (nodeGraphic.name ?? '').split(':');
        if (this.wiringFrom && componentId && nodeId) {
          this.highlightNode(componentId, nodeId);
          this.wirePreviewHandler?.(componentId, nodeId);
        }
      });
      nodeGraphic.on('pointerout', () => {
        if (this.wiringFrom) {
          this.wirePreviewHandler?.(this.wiringFrom.key.split(':')[0], null);
        }
      });
      nodeGraphic.on('rightclick', (event: PIXI.FederatedPointerEvent) => {
        event.stopPropagation();
        const [componentId, nodeId] = (nodeGraphic.name ?? '').split(':');
        if (componentId && nodeId) {
          this.nodeEditHandler?.(componentId, nodeId);
        }
      });

      const nodeLabel = new PIXI.Text({
        text: node.polarity ? `${node.label} (${node.polarity})` : node.label,
        style: { fill: 0xaecbff, fontSize: 10 }
      });
      nodeLabel.anchor.set(0.5, 1);
      nodeLabel.position.set(node.position.x, node.position.y - 12);

      container.addChild(nodeGraphic);
      container.addChild(nodeLabel);
    });

    container.on('rightclick', (event: PIXI.FederatedPointerEvent) => {
      event.stopPropagation();
      if (!component.runtimeId) return;
      this.contextHandler?.({ type: 'node', id: component.runtimeId });
    });

    container.on('pointerover', () => {
      body.fill(0x29354d);
    });
    container.on('pointerout', () => {
      body.fill(0x1f2a3e);
    });

    this.app.stage.addChild(container);
    this.componentGraphics.set(key, container);
  }

  removeComponentInstance(id: string): void {
    const container = this.componentGraphics.get(id);
    if (container && this.app) {
      this.app.stage.removeChild(container);
      container.destroy({ children: true });
      this.componentGraphics.delete(id);
    }
  }

  setConnection(connection: Connection): void {
    if (!this.app) return;
    const existing = this.connectionGraphics.get(connection.id);
    if (existing) {
      this.connectionGraphics.delete(connection.id);
      this.app.stage.removeChild(existing);
      existing.destroy();
    }
    const g = new PIXI.Graphics();
    g.stroke({ color: 0x2f8cff, width: 4, cap: 'round' });
    const from = this.componentGraphics.get(connection.from.componentId);
    const to = this.componentGraphics.get(connection.to.componentId);
    if (!from || !to) return;
    const fromPos = from.position;
    const toPos = to.position;
    g.moveTo(fromPos.x, fromPos.y);
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2 - 40;
    g.bezierCurveTo(midX, midY, midX, midY, toPos.x, toPos.y);
    g.eventMode = 'static';
    g.cursor = 'pointer';
    g.on('rightclick', (event: PIXI.FederatedPointerEvent) => {
      event.stopPropagation();
      this.contextHandler?.({ type: 'wire', id: connection.id });
    });
    this.app.stage.addChild(g);
    this.connectionGraphics.set(connection.id, g);
  }

  removeConnection(id: string): void {
    const g = this.connectionGraphics.get(id);
    if (g && this.app) {
      this.app.stage.removeChild(g);
      g.destroy();
      this.connectionGraphics.delete(id);
    }
  }

  highlightNode(componentId: string, nodeId: string): void {
    if (!componentId || !nodeId) {
      for (const container of this.componentGraphics.values()) {
        container.children.forEach((child) => {
          if (child instanceof PIXI.Graphics) {
            child.scale.set(1);
          }
        });
      }
      return;
    }
    const key = `${componentId}:${nodeId}`;
    for (const container of this.componentGraphics.values()) {
      container.children.forEach((child) => {
        if (child.name === key && child instanceof PIXI.Graphics) {
          child.scale.set(1.3);
        } else if (child instanceof PIXI.Graphics) {
          child.scale.set(1);
        }
      });
    }
  }

  onContextMenu(handler: ContextHandler): void {
    this.contextHandler = handler;
  }

  onNodeEdit(handler: NodeEditHandler): void {
    this.nodeEditHandler = handler;
  }

  onWireComplete(handler: (from: string, to: string) => void) {
    this.wireCompleteHandler = handler;
  }

  onWirePreview(handler: (componentId: string, nodeId: string | null) => void) {
    this.wirePreviewHandler = handler;
  }

  updateSimulation(snapshot: SimulationSnapshot): void {
    if (!this.app) return;
    for (const [componentId, container] of this.componentGraphics.entries()) {
      const glow = snapshot.nodeVoltages[componentId] ?? 0;
      container.alpha = Math.min(1, 0.6 + glow / 12);
    }
  }

  private beginWire(key: string, global: PIXI.IPointData) {
    this.wiringFrom = { key, global: new PIXI.Point(global.x, global.y) };
    if (this.wirePreview) {
      this.wirePreview.clear();
    }
  }

  private cancelWire() {
    this.wiringFrom = undefined;
    if (this.wirePreview) {
      this.wirePreview.clear();
    }
    this.wirePreviewHandler?.('', null);
  }
}
