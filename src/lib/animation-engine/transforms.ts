'use client';

export interface Transform {
  scale: { x: number; y: number };
  rotation: number; // in degrees
  skew: { x: number; y: number };
  origin: { x: number; y: number }; // transform origin (0-1)
}

export interface GradientStop {
  offset: number; // 0-1
  color: string;
  opacity?: number;
}

export interface LinearGradient {
  type: 'linear';
  angle: number; // in degrees
  stops: GradientStop[];
}

export interface RadialGradient {
  type: 'radial';
  centerX: number; // 0-1
  centerY: number; // 0-1
  radius: number; // 0-1
  stops: GradientStop[];
}

export interface ConicGradient {
  type: 'conic';
  centerX: number; // 0-1
  centerY: number; // 0-1
  angle: number; // in degrees
  stops: GradientStop[];
}

export type Gradient = LinearGradient | RadialGradient | ConicGradient;

const defaultTransform: Transform = {
  scale: { x: 1, y: 1 },
  rotation: 0,
  skew: { x: 0, y: 0 },
  origin: { x: 0.5, y: 0.5 },
};

export class TransformUtils {
  static applyTransform(
    ctx: CanvasRenderingContext2D,
    transform: Partial<Transform> = {},
    bounds: { width: number; height: number }
  ): void {
    const t = { ...defaultTransform, ...transform };

    // Move to transform origin
    const originX = bounds.width * t.origin.x;
    const originY = bounds.height * t.origin.y;
    ctx.translate(originX, originY);

    // Apply rotation
    if (t.rotation !== 0) {
      ctx.rotate((t.rotation * Math.PI) / 180);
    }

    // Apply scale
    if (t.scale.x !== 1 || t.scale.y !== 1) {
      ctx.scale(t.scale.x, t.scale.y);
    }

    // Apply skew using transform matrix
    if (t.skew.x !== 0 || t.skew.y !== 0) {
      const skewX = Math.tan((t.skew.x * Math.PI) / 180);
      const skewY = Math.tan((t.skew.y * Math.PI) / 180);
      ctx.transform(1, skewY, skewX, 1, 0, 0);
    }

    // Move back from origin
    ctx.translate(-originX, -originY);
  }

  static createTransformMatrix(
    transform: Partial<Transform> = {},
    bounds: { width: number; height: number }
  ): DOMMatrix {
    const t = { ...defaultTransform, ...transform };
    const matrix = new DOMMatrix();

    const originX = bounds.width * t.origin.x;
    const originY = bounds.height * t.origin.y;

    return matrix
      .translate(originX, originY)
      .rotate(t.rotation)
      .scale(t.scale.x, t.scale.y)
      .skewX(t.skew.x)
      .skewY(t.skew.y)
      .translate(-originX, -originY);
  }

  static interpolateTransform(
    from: Partial<Transform>,
    to: Partial<Transform>,
    progress: number
  ): Transform {
    const fromT = { ...defaultTransform, ...from };
    const toT = { ...defaultTransform, ...to };

    return {
      scale: {
        x: this.lerp(fromT.scale.x, toT.scale.x, progress),
        y: this.lerp(fromT.scale.y, toT.scale.y, progress),
      },
      rotation: this.lerpAngle(fromT.rotation, toT.rotation, progress),
      skew: {
        x: this.lerp(fromT.skew.x, toT.skew.x, progress),
        y: this.lerp(fromT.skew.y, toT.skew.y, progress),
      },
      origin: {
        x: this.lerp(fromT.origin.x, toT.origin.x, progress),
        y: this.lerp(fromT.origin.y, toT.origin.y, progress),
      },
    };
  }

  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private static lerpAngle(a: number, b: number, t: number): number {
    const diff = ((b - a + 540) % 360) - 180;
    return a + diff * t;
  }
}

export class GradientUtils {
  static createGradient(
    ctx: CanvasRenderingContext2D,
    gradient: Gradient,
    bounds: { x: number; y: number; width: number; height: number }
  ): CanvasGradient {
    switch (gradient.type) {
      case 'linear':
        return this.createLinearGradient(ctx, gradient, bounds);
      case 'radial':
        return this.createRadialGradient(ctx, gradient, bounds);
      case 'conic':
        return this.createConicGradient(ctx, gradient, bounds);
      default:
        throw new Error(`Unsupported gradient type: ${(gradient as any).type}`);
    }
  }

  private static createLinearGradient(
    ctx: CanvasRenderingContext2D,
    gradient: LinearGradient,
    bounds: { x: number; y: number; width: number; height: number }
  ): CanvasGradient {
    const angle = (gradient.angle * Math.PI) / 180;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    const length = Math.max(bounds.width, bounds.height);
    const x1 = centerX - (Math.cos(angle) * length) / 2;
    const y1 = centerY - (Math.sin(angle) * length) / 2;
    const x2 = centerX + (Math.cos(angle) * length) / 2;
    const y2 = centerY + (Math.sin(angle) * length) / 2;

    const canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    this.applyGradientStops(canvasGradient, gradient.stops);

    return canvasGradient;
  }

  private static createRadialGradient(
    ctx: CanvasRenderingContext2D,
    gradient: RadialGradient,
    bounds: { x: number; y: number; width: number; height: number }
  ): CanvasGradient {
    const centerX = bounds.x + bounds.width * gradient.centerX;
    const centerY = bounds.y + bounds.height * gradient.centerY;
    const radius = Math.max(bounds.width, bounds.height) * gradient.radius;

    const canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    this.applyGradientStops(canvasGradient, gradient.stops);

    return canvasGradient;
  }

  private static createConicGradient(
    ctx: CanvasRenderingContext2D,
    gradient: ConicGradient,
    bounds: { x: number; y: number; width: number; height: number }
  ): CanvasGradient {
    const centerX = bounds.x + bounds.width * gradient.centerX;
    const centerY = bounds.y + bounds.height * gradient.centerY;

    // Note: CanvasRenderingContext2D doesn't have native conic gradient support
    // This is a fallback that creates a radial gradient
    // For true conic gradients, we'd need to use a more complex approach or WebGL
    const canvasGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      Math.max(bounds.width, bounds.height) / 2
    );
    this.applyGradientStops(canvasGradient, gradient.stops);

    return canvasGradient;
  }

  private static applyGradientStops(canvasGradient: CanvasGradient, stops: GradientStop[]): void {
    stops.forEach((stop) => {
      const color =
        stop.opacity !== undefined ? this.addOpacityToColor(stop.color, stop.opacity) : stop.color;
      canvasGradient.addColorStop(stop.offset, color);
    });
  }

  private static addOpacityToColor(color: string, opacity: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }

    return color;
  }

  static interpolateGradient(from: Gradient, to: Gradient, progress: number): Gradient {
    if (from.type !== to.type) {
      return progress < 0.5 ? from : to;
    }

    switch (from.type) {
      case 'linear':
        return this.interpolateLinearGradient(from, to as LinearGradient, progress);
      case 'radial':
        return this.interpolateRadialGradient(from, to as RadialGradient, progress);
      case 'conic':
        return this.interpolateConicGradient(from, to as ConicGradient, progress);
    }
  }

  private static interpolateLinearGradient(
    from: LinearGradient,
    to: LinearGradient,
    progress: number
  ): LinearGradient {
    return {
      type: 'linear',
      angle: this.lerpAngle(from.angle, to.angle, progress),
      stops: this.interpolateGradientStops(from.stops, to.stops, progress),
    };
  }

  private static interpolateRadialGradient(
    from: RadialGradient,
    to: RadialGradient,
    progress: number
  ): RadialGradient {
    return {
      type: 'radial',
      centerX: this.lerp(from.centerX, to.centerX, progress),
      centerY: this.lerp(from.centerY, to.centerY, progress),
      radius: this.lerp(from.radius, to.radius, progress),
      stops: this.interpolateGradientStops(from.stops, to.stops, progress),
    };
  }

  private static interpolateConicGradient(
    from: ConicGradient,
    to: ConicGradient,
    progress: number
  ): ConicGradient {
    return {
      type: 'conic',
      centerX: this.lerp(from.centerX, to.centerX, progress),
      centerY: this.lerp(from.centerY, to.centerY, progress),
      angle: this.lerpAngle(from.angle, to.angle, progress),
      stops: this.interpolateGradientStops(from.stops, to.stops, progress),
    };
  }

  private static interpolateGradientStops(
    from: GradientStop[],
    to: GradientStop[],
    progress: number
  ): GradientStop[] {
    const maxLength = Math.max(from.length, to.length);
    const result: GradientStop[] = [];

    for (let i = 0; i < maxLength; i++) {
      const fromStop = from[i] || from[from.length - 1];
      const toStop = to[i] || to[to.length - 1];

      result.push({
        offset: this.lerp(fromStop.offset, toStop.offset, progress),
        color: progress < 0.5 ? fromStop.color : toStop.color, // Simple color interpolation
        opacity:
          fromStop.opacity !== undefined && toStop.opacity !== undefined
            ? this.lerp(fromStop.opacity, toStop.opacity, progress)
            : undefined,
      });
    }

    return result;
  }

  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private static lerpAngle(a: number, b: number, t: number): number {
    const diff = ((b - a + 540) % 360) - 180;
    return a + diff * t;
  }
}

// Predefined gradient presets
export const gradientPresets: Record<string, Gradient> = {
  sunset: {
    type: 'linear',
    angle: 45,
    stops: [
      { offset: 0, color: '#ff7e5f' },
      { offset: 1, color: '#feb47b' },
    ],
  },
  ocean: {
    type: 'linear',
    angle: 180,
    stops: [
      { offset: 0, color: '#2196F3' },
      { offset: 0.5, color: '#21CBF3' },
      { offset: 1, color: '#2196F3' },
    ],
  },
  neon: {
    type: 'radial',
    centerX: 0.5,
    centerY: 0.5,
    radius: 0.8,
    stops: [
      { offset: 0, color: '#ff006e' },
      { offset: 0.5, color: '#8338ec' },
      { offset: 1, color: '#3a86ff' },
    ],
  },
  rainbow: {
    type: 'conic',
    centerX: 0.5,
    centerY: 0.5,
    angle: 0,
    stops: [
      { offset: 0, color: '#ff0000' },
      { offset: 0.17, color: '#ff8c00' },
      { offset: 0.33, color: '#ffd700' },
      { offset: 0.5, color: '#00ff00' },
      { offset: 0.67, color: '#0080ff' },
      { offset: 0.83, color: '#8000ff' },
      { offset: 1, color: '#ff0000' },
    ],
  },
};
