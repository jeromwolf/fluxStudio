'use client';

import { Keyframe } from '../stores/animation-store';

export type EasingFunction = (t: number) => number;

// Cubic Bezier easing functions
export const easingFunctions: Record<string, EasingFunction> = {
  linear: (t: number) => t,

  // Ease functions
  'ease-in': (t: number) => t * t * t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),

  // Sine functions
  'ease-in-sine': (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  'ease-out-sine': (t: number) => Math.sin((t * Math.PI) / 2),
  'ease-in-out-sine': (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Quadratic functions
  'ease-in-quad': (t: number) => t * t,
  'ease-out-quad': (t: number) => 1 - (1 - t) * (1 - t),
  'ease-in-out-quad': (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  // Cubic functions
  'ease-in-cubic': (t: number) => t * t * t,
  'ease-out-cubic': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out-cubic': (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),

  // Quartic functions
  'ease-in-quart': (t: number) => t * t * t * t,
  'ease-out-quart': (t: number) => 1 - Math.pow(1 - t, 4),
  'ease-in-out-quart': (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,

  // Quintic functions
  'ease-in-quint': (t: number) => t * t * t * t * t,
  'ease-out-quint': (t: number) => 1 - Math.pow(1 - t, 5),
  'ease-in-out-quint': (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,

  // Exponential functions
  'ease-in-expo': (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  'ease-out-expo': (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  'ease-in-out-expo': (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  // Circular functions
  'ease-in-circ': (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  'ease-out-circ': (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  'ease-in-out-circ': (t: number) => {
    return t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  },

  // Back functions
  'ease-in-back': (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  'ease-out-back': (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  'ease-in-out-back': (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic functions
  'ease-in-elastic': (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  'ease-out-elastic': (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  'ease-in-out-elastic': (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },

  // Bounce functions
  'ease-in-bounce': (t: number) => 1 - easingFunctions['ease-out-bounce'](1 - t),
  'ease-out-bounce': (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  'ease-in-out-bounce': (t: number) => {
    return t < 0.5
      ? (1 - easingFunctions['ease-out-bounce'](1 - 2 * t)) / 2
      : (1 + easingFunctions['ease-out-bounce'](2 * t - 1)) / 2;
  },
};

export interface KeyframeInterpolationOptions {
  easing?: string | EasingFunction;
  property: string;
}

export class KeyframeSystem {
  static interpolateValue(
    fromKeyframe: Keyframe,
    toKeyframe: Keyframe,
    currentTime: number,
    options: KeyframeInterpolationOptions
  ): any {
    const { easing = 'linear', property } = options;

    // Calculate normalized time (0-1) between keyframes
    const timeDiff = toKeyframe.time - fromKeyframe.time;
    if (timeDiff <= 0) return fromKeyframe.value;

    const progress = Math.max(0, Math.min(1, (currentTime - fromKeyframe.time) / timeDiff));

    // Apply easing function
    const easingFn =
      typeof easing === 'string' ? easingFunctions[easing] || easingFunctions.linear : easing;
    const easedProgress = easingFn(progress);

    // Interpolate based on value type
    return this.interpolateByType(fromKeyframe.value, toKeyframe.value, easedProgress, property);
  }

  private static interpolateByType(
    fromValue: any,
    toValue: any,
    progress: number,
    property: string
  ): any {
    // Number interpolation
    if (typeof fromValue === 'number' && typeof toValue === 'number') {
      return this.lerp(fromValue, toValue, progress);
    }

    // Position/Vector interpolation
    if (this.isPosition(fromValue) && this.isPosition(toValue)) {
      return {
        x: this.lerp(fromValue.x, toValue.x, progress),
        y: this.lerp(fromValue.y, toValue.y, progress),
      };
    }

    // Scale interpolation
    if (this.isScale(fromValue) && this.isScale(toValue)) {
      return {
        x: this.lerp(fromValue.x, toValue.x, progress),
        y: this.lerp(fromValue.y, toValue.y, progress),
      };
    }

    // Color interpolation
    if (
      typeof fromValue === 'string' &&
      typeof toValue === 'string' &&
      property.toLowerCase().includes('color')
    ) {
      return this.interpolateColor(fromValue, toValue, progress);
    }

    // Array interpolation (for dash arrays, etc.)
    if (Array.isArray(fromValue) && Array.isArray(toValue)) {
      return this.interpolateArray(fromValue, toValue, progress);
    }

    // Boolean or discrete values (no interpolation)
    if (typeof fromValue === 'boolean' || typeof toValue === 'boolean') {
      return progress < 0.5 ? fromValue : toValue;
    }

    // String values (no interpolation)
    if (typeof fromValue === 'string' && typeof toValue === 'string') {
      return progress < 0.5 ? fromValue : toValue;
    }

    // Default: no interpolation
    return progress < 0.5 ? fromValue : toValue;
  }

  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private static isPosition(value: any): value is { x: number; y: number } {
    return value && typeof value.x === 'number' && typeof value.y === 'number';
  }

  private static isScale(value: any): value is { x: number; y: number } {
    return value && typeof value.x === 'number' && typeof value.y === 'number';
  }

  private static interpolateColor(fromColor: string, toColor: string, progress: number): string {
    // Simple RGB interpolation (could be enhanced with HSL, LAB, etc.)
    const from = this.parseColor(fromColor);
    const to = this.parseColor(toColor);

    if (!from || !to) return progress < 0.5 ? fromColor : toColor;

    const r = Math.round(this.lerp(from.r, to.r, progress));
    const g = Math.round(this.lerp(from.g, to.g, progress));
    const b = Math.round(this.lerp(from.b, to.b, progress));
    const a =
      from.a !== undefined && to.a !== undefined
        ? this.lerp(from.a, to.a, progress)
        : (from.a ?? to.a ?? 1);

    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  }

  private static parseColor(color: string): { r: number; g: number; b: number; a?: number } | null {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16),
        };
      } else if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
        };
      }
    }

    // Handle rgb/rgba colors
    const rgbMatch = color.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
      const values = rgbMatch[1].split(',').map((v) => parseFloat(v.trim()));
      return {
        r: values[0],
        g: values[1],
        b: values[2],
        a: values.length > 3 ? values[3] : undefined,
      };
    }

    return null;
  }

  private static interpolateArray(fromArray: any[], toArray: any[], progress: number): any[] {
    const maxLength = Math.max(fromArray.length, toArray.length);
    const result: any[] = [];

    for (let i = 0; i < maxLength; i++) {
      const fromValue = fromArray[i] ?? fromArray[fromArray.length - 1];
      const toValue = toArray[i] ?? toArray[toArray.length - 1];

      if (typeof fromValue === 'number' && typeof toValue === 'number') {
        result.push(this.lerp(fromValue, toValue, progress));
      } else {
        result.push(progress < 0.5 ? fromValue : toValue);
      }
    }

    return result;
  }

  static getValueAtTime(keyframes: Keyframe[], currentTime: number, property: string): any {
    if (keyframes.length === 0) return undefined;

    // Sort keyframes by time
    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

    // If before first keyframe, return first value
    if (currentTime <= sortedKeyframes[0].time) {
      return sortedKeyframes[0].value;
    }

    // If after last keyframe, return last value
    if (currentTime >= sortedKeyframes[sortedKeyframes.length - 1].time) {
      return sortedKeyframes[sortedKeyframes.length - 1].value;
    }

    // Find the two keyframes to interpolate between
    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      const fromKeyframe = sortedKeyframes[i];
      const toKeyframe = sortedKeyframes[i + 1];

      if (currentTime >= fromKeyframe.time && currentTime <= toKeyframe.time) {
        const easing = toKeyframe.easing || fromKeyframe.easing || 'linear';
        return this.interpolateValue(fromKeyframe, toKeyframe, currentTime, { easing, property });
      }
    }

    return sortedKeyframes[sortedKeyframes.length - 1].value;
  }

  static createKeyframe(time: number, value: any, easing: string = 'linear'): Keyframe {
    return { time, value, easing };
  }

  static optimizeKeyframes(keyframes: Keyframe[]): Keyframe[] {
    if (keyframes.length <= 2) return keyframes;

    const optimized: Keyframe[] = [keyframes[0]]; // Always keep first keyframe

    for (let i = 1; i < keyframes.length - 1; i++) {
      const prev = keyframes[i - 1];
      const current = keyframes[i];
      const next = keyframes[i + 1];

      // Keep keyframe if it's not redundant
      if (!this.isRedundantKeyframe(prev, current, next)) {
        optimized.push(current);
      }
    }

    optimized.push(keyframes[keyframes.length - 1]); // Always keep last keyframe
    return optimized;
  }

  private static isRedundantKeyframe(prev: Keyframe, current: Keyframe, next: Keyframe): boolean {
    // If easing changes, keep the keyframe
    if (current.easing !== prev.easing) return false;

    // For numbers, check if the current keyframe is on the linear path between prev and next
    if (
      typeof prev.value === 'number' &&
      typeof current.value === 'number' &&
      typeof next.value === 'number'
    ) {
      const expectedValue = this.lerp(
        prev.value,
        next.value,
        (current.time - prev.time) / (next.time - prev.time)
      );

      const threshold = Math.abs(next.value - prev.value) * 0.01; // 1% threshold
      return Math.abs(current.value - expectedValue) < threshold;
    }

    // For other types, keep all keyframes
    return false;
  }
}

// Export commonly used easing presets
export const easingPresets = {
  // UI animations
  'ui-smooth': 'ease-in-out-cubic',
  'ui-snappy': 'ease-out-back',
  'ui-bounce': 'ease-out-bounce',
  'ui-elastic': 'ease-out-elastic',

  // Motion graphics
  'motion-smooth': 'ease-in-out-quart',
  'motion-fast': 'ease-out-expo',
  'motion-slow': 'ease-in-out-sine',

  // Physics-like
  'physics-bounce': 'ease-out-bounce',
  'physics-spring': 'ease-out-back',
  'physics-decay': 'ease-out-expo',
} as const;
