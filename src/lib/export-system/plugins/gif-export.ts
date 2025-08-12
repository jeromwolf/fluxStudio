'use client';

import { ShapeRenderer } from '../../animation-engine/shapes';
import {
  ExportPlugin,
  ExportContext,
  ExportResult,
  ExportUtils,
  ExportError,
} from '../base-plugin';

// Dynamic import for GIF.js to avoid SSR issues
let GIF: any = null;

async function loadGIF() {
  if (!GIF && typeof window !== 'undefined') {
    const gifModule = await import('gif.js');
    GIF = gifModule.default;
  }
  return GIF;
}

export class GifExportPlugin extends ExportPlugin {
  readonly id = 'gif';
  readonly name = 'Animated GIF';
  readonly description = 'Export animation as optimized GIF with color reduction';
  readonly fileExtension = 'gif';
  readonly mimeType = 'image/gif';
  readonly category = 'animation';
  readonly supportsTransparency = true;
  readonly supportsAnimation = true;
  readonly maxDuration = 30000; // 30 seconds max for GIF
  readonly defaultSettings = {
    quality: 10, // GIF quality (1-20, lower = better)
    fps: 12, // Lower FPS for smaller file size
    loop: true,
    transparent: false, // GIF transparency can be problematic
  };

  async export(context: ExportContext): Promise<ExportResult> {
    const { canvas, project, settings, onProgress } = context;

    try {
      // Load GIF.js
      const GIFClass = await loadGIF();
      if (!GIFClass) {
        throw new ExportError('GIF.js library not available', 'LIBRARY_ERROR', this.id);
      }

      onProgress?.({
        progress: 0,
        stage: 'setup',
        message: 'Setting up GIF export...',
      });

      // Validate settings
      const errors = this.validate(settings);
      if (errors.length > 0) {
        throw new ExportError(
          `Invalid settings: ${errors.join(', ')}`,
          'VALIDATION_ERROR',
          this.id
        );
      }

      // Calculate frame count and timing
      const frameRate = Math.min(settings.fps, 30); // Cap at 30fps for GIF
      const totalFrames = Math.ceil((settings.duration / 1000) * frameRate);
      const frameDelay = 1000 / frameRate;

      if (totalFrames > 300) {
        throw new ExportError('Too many frames (max 300 for GIF)', 'FRAME_LIMIT_ERROR', this.id);
      }

      // Create GIF encoder
      const gif = new GIFClass({
        workers: Math.min(4, navigator.hardwareConcurrency || 2),
        quality: settings.quality || 10,
        width: settings.width,
        height: settings.height,
        transparent: settings.transparent ? 0x00000000 : null,
        repeat: settings.loop ? 0 : -1, // 0 = loop forever, -1 = no loop
        workerScript: '/gif.worker.js', // We'll need to add this to public folder
      });

      // Set up progress tracking
      // let processedFrames = 0;
      const renderProgress = 0.7; // 70% for rendering, 30% for encoding

      onProgress?.({
        progress: 0.1,
        stage: 'render',
        message: 'Rendering frames...',
        totalFrames,
        currentFrame: 0,
      });

      // Create export canvas
      const exportCanvas = ExportUtils.createCanvas(settings.width, settings.height);
      const shapeRenderer = new ShapeRenderer();

      // Render all frames
      for (let frame = 0; frame < totalFrames; frame++) {
        if (frame % 10 === 0) {
          // Update progress every 10 frames
          onProgress?.({
            progress: 0.1 + (frame / totalFrames) * renderProgress,
            stage: 'render',
            message: `Rendering frame ${frame + 1}/${totalFrames}...`,
            currentFrame: frame + 1,
            totalFrames,
          });
        }

        // Calculate time for this frame
        const frameTime = (frame / (totalFrames - 1)) * settings.duration;

        // Render frame
        await ExportUtils.renderFrame(canvas, exportCanvas, frameTime, project, shapeRenderer);

        // Add frame to GIF
        gif.addFrame(exportCanvas, { delay: frameDelay });
        // processedFrames++;
      }

      onProgress?.({
        progress: 0.8,
        stage: 'encode',
        message: 'Encoding GIF...',
      });

      // Return a promise that resolves when GIF is ready
      return new Promise((resolve) => {
        gif.on('finished', (blob: Blob) => {
          const filename = ExportUtils.generateFilename(`${project.name || 'animation'}`, 'gif');

          resolve({
            success: true,
            data: blob,
            url: URL.createObjectURL(blob),
            filename,
            size: blob.size,
            metadata: {
              width: settings.width,
              height: settings.height,
              frames: totalFrames,
              fps: frameRate,
              duration: settings.duration,
              loop: settings.loop,
            },
          });
        });

        gif.on('progress', (progress: number) => {
          onProgress?.({
            progress: 0.8 + progress * 0.2,
            stage: 'encode',
            message: `Encoding GIF... ${Math.round(progress * 100)}%`,
          });
        });

        gif.on('abort', () => {
          resolve({
            success: false,
            filename: 'export-cancelled.gif',
            error: 'Export was cancelled',
          });
        });

        // Start rendering
        gif.render();
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        filename: 'export-failed.gif',
        error: errorMessage,
      };
    }
  }

  cancel(): void {
    // GIF.js doesn't have a direct cancel method, but we can abort
    // This would need to be implemented by storing the GIF instance
  }

  estimateExportTime(settings: any): number {
    const frames = Math.ceil((settings.duration / 1000) * settings.fps);
    return frames * 100 + 5000; // 100ms per frame + 5s encoding
  }

  getMemoryRequirements(settings: any): number {
    const baseMemory = super.getMemoryRequirements(settings);
    // GIF encoding requires additional memory for color quantization
    return baseMemory * 1.5;
  }

  getOptionsSchema(): Record<string, any> {
    return {
      quality: {
        type: 'number',
        min: 1,
        max: 20,
        step: 1,
        default: 10,
        label: 'Quality',
        description: 'GIF quality (1 = best, 20 = worst, smaller file)',
      },
      fps: {
        type: 'number',
        min: 1,
        max: 30,
        step: 1,
        default: 12,
        label: 'Frame Rate',
        description: 'Frames per second (lower = smaller file)',
      },
      loop: {
        type: 'boolean',
        default: true,
        label: 'Loop Animation',
        description: 'Loop the animation continuously',
      },
      transparent: {
        type: 'boolean',
        default: false,
        label: 'Transparent Background',
        description: 'Use transparent background (may increase file size)',
      },
    };
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Worker' in window;
  }
}
