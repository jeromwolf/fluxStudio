'use client';

import { ShapeRenderer } from '../../animation-engine/shapes';
import {
  ExportPlugin,
  ExportContext,
  ExportResult,
  ExportUtils,
  ExportError,
} from '../base-plugin';

export class PngExportPlugin extends ExportPlugin {
  readonly id = 'png';
  readonly name = 'PNG Image';
  readonly description = 'Export single frame as PNG image with transparency support';
  readonly fileExtension = 'png';
  readonly mimeType = 'image/png';
  readonly category = 'image';
  readonly supportsTransparency = true;
  readonly supportsAnimation = false;
  readonly maxDuration = undefined; // No duration limit for single frame
  readonly defaultSettings = {
    quality: 1.0,
    transparent: true,
  };

  async export(context: ExportContext): Promise<ExportResult> {
    const { canvas, project, settings, onProgress } = context;

    try {
      onProgress?.({
        progress: 0,
        stage: 'setup',
        message: 'Setting up PNG export...',
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

      // Create export canvas with desired dimensions
      const exportCanvas = ExportUtils.createCanvas(settings.width, settings.height);
      const exportCtx = exportCanvas.getContext('2d');

      if (!exportCtx) {
        throw new ExportError('Cannot create canvas context', 'CONTEXT_ERROR', this.id);
      }

      onProgress?.({
        progress: 0.2,
        stage: 'render',
        message: 'Rendering frame...',
      });

      // Set up canvas
      if (!settings.transparent) {
        exportCtx.fillStyle = settings.background || project.backgroundColor || '#ffffff';
        exportCtx.fillRect(0, 0, settings.width, settings.height);
      }

      // Create shape renderer
      const shapeRenderer = new ShapeRenderer();

      // Render at current time (for single frame)
      const renderTime = project.currentTime || 0;

      await ExportUtils.renderFrame(canvas, exportCanvas, renderTime, project, shapeRenderer);

      onProgress?.({
        progress: 0.8,
        stage: 'encode',
        message: 'Encoding PNG...',
      });

      // Convert to PNG
      const dataURL = exportCanvas.toDataURL('image/png', settings.quality);
      const blob = ExportUtils.dataURLToBlob(dataURL);
      const filename = ExportUtils.generateFilename(`${project.name || 'animation'}`, 'png');

      onProgress?.({
        progress: 1.0,
        stage: 'complete',
        message: 'PNG export completed',
      });

      return {
        success: true,
        data: blob,
        url: URL.createObjectURL(blob),
        filename,
        size: blob.size,
        metadata: {
          width: settings.width,
          height: settings.height,
          transparent: settings.transparent,
          timestamp: renderTime,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        filename: 'export-failed.png',
        error: errorMessage,
      };
    }
  }

  getOptionsSchema(): Record<string, any> {
    return {
      transparent: {
        type: 'boolean',
        default: true,
        label: 'Transparent Background',
        description: 'Export with transparent background',
      },
      quality: {
        type: 'number',
        min: 0.1,
        max: 1.0,
        step: 0.1,
        default: 1.0,
        label: 'Quality',
        description: 'PNG quality (higher = better quality, larger file)',
      },
    };
  }
}
