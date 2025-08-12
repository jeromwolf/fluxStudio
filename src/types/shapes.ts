export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Transform {
  position: Vector2;
  rotation: number;
  scale: Vector2;
}

export interface GradientStop {
  offset: number;
  color: Color;
}

export interface Gradient {
  type: 'linear' | 'radial';
  stops: GradientStop[];
  start: Vector2;
  end: Vector2;
}

export interface ShapeStyle {
  fill?: Color | Gradient;
  stroke?: Color;
  strokeWidth?: number;
  opacity?: number;
}

export interface BaseShape {
  id: string;
  type: string;
  transform: Transform;
  style: ShapeStyle;
  visible: boolean;
  zIndex: number;
}

export interface Circle extends BaseShape {
  type: 'circle';
  radius: number;
}

export interface Line extends BaseShape {
  type: 'line';
  start: Vector2;
  end: Vector2;
}

export interface Network extends BaseShape {
  type: 'network';
  nodes: NetworkNode[];
  connections: NetworkConnection[];
}

export interface NetworkNode {
  id: string;
  position: Vector2;
  radius: number;
  color?: Color;
}

export interface NetworkConnection {
  from: string;
  to: string;
  strength: number;
  color?: Color;
}

export interface Particle extends BaseShape {
  type: 'particle';
  velocity: Vector2;
  life: number;
  maxLife: number;
  size: number;
}

export type Shape = Circle | Line | Network | Particle;

export interface RenderContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | WebGLRenderingContext;
  isWebGL: boolean;
  width: number;
  height: number;
  devicePixelRatio: number;
}
