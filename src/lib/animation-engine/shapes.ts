'use client';

import { Shape } from '../stores/animation-store';

export interface RenderContext {
  ctx: CanvasRenderingContext2D | WebGLRenderingContext;
  width: number;
  height: number;
  currentTime: number;
  theme: 'light' | 'dark';
}

export interface CircleProperties {
  radius: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  blur: number;
  glow: boolean;
  glowColor: string;
  glowSize: number;
}

export interface LineProperties {
  endPosition: { x: number; y: number };
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  dashArray: number[];
  animated: boolean;
  animationSpeed: number;
}

export interface NodeProperties {
  size: number;
  color: string;
  connections: string[];
  pulseSpeed: number;
  pulseIntensity: number;
  label?: string;
  labelColor: string;
  labelSize: number;
}

export interface NetworkProperties {
  nodes: Array<{ id: string; position: { x: number; y: number }; properties: NodeProperties }>;
  edges: Array<{ from: string; to: string; strength: number; animated: boolean }>;
  particleCount: number;
  particleSpeed: number;
  connectionThreshold: number;
}

const defaultCircleProps: CircleProperties = {
  radius: 50,
  fillColor: '#3b82f6',
  strokeColor: '#1e40af',
  strokeWidth: 2,
  opacity: 1,
  blur: 0,
  glow: false,
  glowColor: '#3b82f6',
  glowSize: 10,
};

const defaultLineProps: LineProperties = {
  endPosition: { x: 100, y: 100 },
  strokeColor: '#3b82f6',
  strokeWidth: 2,
  opacity: 1,
  dashArray: [],
  animated: false,
  animationSpeed: 1,
};

const defaultNodeProps: NodeProperties = {
  size: 30,
  color: '#3b82f6',
  connections: [],
  pulseSpeed: 1,
  pulseIntensity: 0.3,
  labelColor: '#ffffff',
  labelSize: 12,
};

export class ShapeRenderer {
  private animationOffset: number = 0;

  constructor() {}

  updateAnimation(deltaTime: number) {
    this.animationOffset += deltaTime * 0.001;
  }

  renderShape(shape: Shape, context: RenderContext): void {
    if (!(context.ctx instanceof CanvasRenderingContext2D)) return;

    const ctx = context.ctx;

    ctx.save();
    ctx.translate(shape.position.x, shape.position.y);

    switch (shape.type) {
      case 'circle':
        this.renderCircle(shape, ctx, context);
        break;
      case 'line':
        this.renderLine(shape, ctx, context);
        break;
      case 'node':
        this.renderNode(shape, ctx, context);
        break;
      case 'network':
        this.renderNetwork(shape, ctx, context);
        break;
    }

    ctx.restore();
  }

  private renderCircle(shape: Shape, ctx: CanvasRenderingContext2D, _context: RenderContext): void {
    const props: CircleProperties = { ...defaultCircleProps, ...shape.properties };

    ctx.globalAlpha = props.opacity;

    if (props.glow) {
      ctx.save();
      ctx.shadowColor = props.glowColor;
      ctx.shadowBlur = props.glowSize;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    if (props.blur > 0) {
      ctx.filter = `blur(${props.blur}px)`;
    }

    ctx.beginPath();
    ctx.arc(0, 0, props.radius, 0, Math.PI * 2);

    if (props.fillColor !== 'transparent') {
      ctx.fillStyle = props.fillColor;
      ctx.fill();
    }

    if (props.strokeWidth > 0 && props.strokeColor !== 'transparent') {
      ctx.strokeStyle = props.strokeColor;
      ctx.lineWidth = props.strokeWidth;
      ctx.stroke();
    }

    if (props.glow) {
      ctx.restore();
    }

    ctx.filter = 'none';
    ctx.globalAlpha = 1;
  }

  private renderLine(shape: Shape, ctx: CanvasRenderingContext2D, _context: RenderContext): void {
    const props: LineProperties = { ...defaultLineProps, ...shape.properties };

    ctx.globalAlpha = props.opacity;
    ctx.strokeStyle = props.strokeColor;
    ctx.lineWidth = props.strokeWidth;

    if (props.dashArray.length > 0) {
      ctx.setLineDash(props.dashArray);
      if (props.animated) {
        ctx.lineDashOffset = -this.animationOffset * props.animationSpeed * 20;
      }
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(props.endPosition.x, props.endPosition.y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.globalAlpha = 1;
  }

  private renderNode(shape: Shape, ctx: CanvasRenderingContext2D, _context: RenderContext): void {
    const props: NodeProperties = { ...defaultNodeProps, ...shape.properties };

    const pulseScale =
      1 + Math.sin(this.animationOffset * props.pulseSpeed * 2 * Math.PI) * props.pulseIntensity;
    const radius = props.size * pulseScale;

    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = props.color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.lightenColor(props.color, 0.3);
    ctx.lineWidth = 2;
    ctx.stroke();

    if (props.label) {
      ctx.save();
      ctx.fillStyle = props.labelColor;
      ctx.font = `${props.labelSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(props.label, 0, radius + props.labelSize + 5);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }

  private renderNetwork(shape: Shape, ctx: CanvasRenderingContext2D, context: RenderContext): void {
    const props: NetworkProperties = { ...shape.properties } as NetworkProperties;

    if (!props.nodes || !props.edges) return;

    ctx.save();
    // 네트워크는 이미 절대 좌표를 사용하므로 translate 불필요

    this.renderNetworkConnections(props, ctx, context);
    this.renderNetworkNodes(props, ctx, context);
    this.renderNetworkParticles(props, ctx, context);

    ctx.restore();
  }

  private renderNetworkConnections(
    props: NetworkProperties,
    ctx: CanvasRenderingContext2D,
    _context: RenderContext
  ): void {
    props.edges.forEach((edge) => {
      const fromNode = props.nodes.find((n) => n.id === edge.from);
      const toNode = props.nodes.find((n) => n.id === edge.to);

      if (!fromNode || !toNode) return;

      ctx.globalAlpha = edge.strength * 0.5;
      ctx.strokeStyle = _context.theme === 'dark' ? '#4a5568' : '#cbd5e0';
      ctx.lineWidth = Math.max(1, edge.strength * 3);

      if (edge.animated) {
        const dashLength = 20;
        const dashGap = 10;
        ctx.setLineDash([dashLength, dashGap]);
        ctx.lineDashOffset = -this.animationOffset * 30;
      }

      ctx.beginPath();
      ctx.moveTo(fromNode.position.x, fromNode.position.y);
      ctx.lineTo(toNode.position.x, toNode.position.y);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
    });

    ctx.globalAlpha = 1;
  }

  private renderNetworkNodes(
    props: NetworkProperties,
    ctx: CanvasRenderingContext2D,
    context: RenderContext
  ): void {
    props.nodes.forEach((node) => {
      ctx.save();
      ctx.translate(node.position.x, node.position.y);

      const nodeShape: Shape = {
        id: node.id,
        type: 'node',
        position: { x: 0, y: 0 },
        properties: node.properties,
        animations: [],
      };

      this.renderNode(nodeShape, ctx, context);
      ctx.restore();
    });
  }

  private renderNetworkParticles(
    props: NetworkProperties,
    ctx: CanvasRenderingContext2D,
    _context: RenderContext
  ): void {
    const particleCount = props.particleCount || 0;
    if (particleCount === 0) return;

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = _context.theme === 'dark' ? '#6366f1' : '#4f46e5';

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + this.animationOffset * props.particleSpeed;
      const distance = 50 + Math.sin(this.animationOffset * 2 + i) * 20;

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  private lightenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}

export const createShape = (
  type: Shape['type'],
  position: { x: number; y: number },
  properties: Partial<CircleProperties | LineProperties | NodeProperties | NetworkProperties> = {}
): Omit<Shape, 'id'> => {
  const defaultProps = {
    circle: defaultCircleProps,
    line: defaultLineProps,
    node: defaultNodeProps,
    network: {},
  };

  return {
    type,
    position,
    properties: { ...defaultProps[type], ...properties },
    animations: [],
  };
};
