'use client';

export interface ExportSettings {
  format: string;
  quality?: number;
  width: number;
  height: number;
  fps: number;
  duration: number;
  background?: string;
  compression?: number;
  loop?: boolean;
  transparent?: boolean;
}

export interface ExportProgress {
  progress: number; // 0-1
  stage: string;
  message: string;
  currentFrame?: number;
  totalFrames?: number;
  estimatedTimeRemaining?: number;
}

export interface ExportResult {
  success: boolean;
  data?: Blob | string;
  url?: string;
  filename: string;
  size?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ExportContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  project: any; // AnimationProject from store
  settings: ExportSettings;
  onProgress?: (progress: ExportProgress) => void;
  onComplete?: (result: ExportResult) => void;
  onError?: (error: string) => void;
}

export abstract class ExportPlugin {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly fileExtension: string;
  abstract readonly mimeType: string;
  abstract readonly category: 'image' | 'video' | 'animation' | 'web';
  abstract readonly supportsTransparency: boolean;
  abstract readonly supportsAnimation: boolean;
  abstract readonly maxDuration?: number; // in milliseconds
  abstract readonly defaultSettings: Partial<ExportSettings>;

  /**
   * Validate export settings
   */
  validate(settings: ExportSettings): string[] {
    const errors: string[] = [];

    if (settings.width <= 0 || settings.height <= 0) {
      errors.push('Invalid dimensions');
    }

    if (settings.duration <= 0) {
      errors.push('Invalid duration');
    }

    if (settings.fps <= 0 || settings.fps > 120) {
      errors.push('Invalid frame rate (must be 1-120 fps)');
    }

    if (this.maxDuration && settings.duration > this.maxDuration) {
      errors.push(`Duration exceeds maximum (${this.maxDuration}ms)`);
    }

    if (!this.supportsTransparency && settings.transparent) {
      errors.push('Format does not support transparency');
    }

    if (!this.supportsAnimation && settings.duration > 100) {
      errors.push('Format does not support animation');
    }

    return errors;
  }

  /**
   * Get optimized settings for the format
   */
  getOptimizedSettings(originalSettings: ExportSettings): ExportSettings {
    return {
      ...originalSettings,
      ...this.defaultSettings,
    };
  }

  /**
   * Export the animation
   */
  abstract export(context: ExportContext): Promise<ExportResult>;

  /**
   * Cancel ongoing export
   */
  cancel(): void {
    // Override in subclasses if cancellation is supported
  }

  /**
   * Estimate export time
   */
  estimateExportTime(settings: ExportSettings): number {
    const baseTimePerFrame = 50; // ms
    const frames = Math.ceil((settings.duration / 1000) * settings.fps);
    return frames * baseTimePerFrame;
  }

  /**
   * Get memory requirements estimate in MB
   */
  getMemoryRequirements(settings: ExportSettings): number {
    const pixelCount = settings.width * settings.height;
    const frames = this.supportsAnimation
      ? Math.ceil((settings.duration / 1000) * settings.fps)
      : 1;

    // Estimate 4 bytes per pixel (RGBA) + overhead
    return ((pixelCount * frames * 4) / (1024 * 1024)) * 2; // 2x for processing overhead
  }

  /**
   * Check if the format is supported in the current environment
   */
  isSupported(): boolean {
    return true; // Override in subclasses for specific checks
  }

  /**
   * Get format-specific export options UI schema
   */
  getOptionsSchema(): Record<string, any> {
    return {
      quality: {
        type: 'number',
        min: 0.1,
        max: 1.0,
        step: 0.1,
        default: 0.8,
        label: 'Quality',
      },
    };
  }
}

export class ExportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly plugin: string
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

// Utility functions for common export operations
export class ExportUtils {
  /**
   * Create a temporary canvas with specified dimensions
   */
  static createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Render a single frame at specified time
   */
  static async renderFrame(
    _sourceCanvas: HTMLCanvasElement,
    targetCanvas: HTMLCanvasElement,
    time: number,
    project: any,
    shapeRenderer: any
  ): Promise<void> {
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) throw new ExportError('Cannot get canvas context', 'CONTEXT_ERROR', 'export-utils');

    // Clear canvas
    ctx.fillStyle = project.backgroundColor || '#000000';
    ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

    // Render shapes at specified time
    const renderContext = {
      ctx,
      width: targetCanvas.width,
      height: targetCanvas.height,
      currentTime: time,
      theme: 'dark' as const,
    };

    project.layers.forEach((layer: any) => {
      if (!layer.visible) return;

      ctx.save();
      ctx.globalAlpha *= layer.opacity;

      layer.shapes.forEach((shape: any) => {
        shapeRenderer.renderShape(shape, renderContext);
      });

      ctx.restore();
    });
  }

  /**
   * Download a blob as a file
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert data URL to blob
   */
  static dataURLToBlob(dataURL: string): Blob {
    const parts = dataURL.split(',');
    const mimeString = parts[0].split(':')[1].split(';')[0];
    const byteString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  }

  /**
   * Generate filename with timestamp
   */
  static generateFilename(baseName: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${baseName}-${timestamp}.${extension}`;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Format duration for display
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  }
}
