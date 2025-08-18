'use client';

import { ShapeRenderer } from '../../animation-engine/shapes';
import {
  ExportPlugin,
  ExportContext,
  ExportResult,
  ExportUtils,
  ExportError,
} from '../base-plugin';

export class Mp4ExportPlugin extends ExportPlugin {
  readonly id = 'mp4';
  readonly name = 'MP4 Video';
  readonly description = 'Export high-quality H.264 video compatible with all platforms';
  readonly fileExtension = 'mp4';
  readonly mimeType = 'video/mp4';
  readonly category = 'video';
  readonly supportsTransparency = false;
  readonly supportsAnimation = true;
  readonly maxDuration = 300000; // 5 minutes max
  readonly defaultSettings = {
    quality: 0.8,
    fps: 30,
    bitrate: 5000000, // 5 Mbps
  };

  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  async export(context: ExportContext): Promise<ExportResult> {
    const { canvas, project, settings, onProgress } = context;

    try {
      onProgress?.({
        progress: 0,
        stage: 'setup',
        message: 'Setting up MP4 export...',
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

      // Create export canvas with proper dimensions
      const exportCanvas = ExportUtils.createCanvas(settings.width, settings.height);
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) {
        throw new ExportError('Cannot get canvas context', 'CONTEXT_ERROR', this.id);
      }

      // Capture stream from canvas
      this.stream = exportCanvas.captureStream(settings.fps);
      
      // Configure MediaRecorder
      const mimeType = this.getBestSupportedMimeType();
      if (!mimeType) {
        throw new ExportError('MP4 encoding not supported in this browser', 'UNSUPPORTED', this.id);
      }

      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: settings.bitrate || 5000000,
      };

      this.recorder = new MediaRecorder(this.stream, options);
      const chunks: Blob[] = [];

      // Set up MediaRecorder event handlers
      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Calculate frame timing
      const frameRate = settings.fps;
      const totalFrames = Math.ceil((settings.duration / 1000) * frameRate);
      const frameDelay = 1000 / frameRate;

      onProgress?.({
        progress: 0.1,
        stage: 'render',
        message: 'Rendering video frames...',
        totalFrames,
        currentFrame: 0,
      });

      // Create shape renderer
      const shapeRenderer = new ShapeRenderer();

      // Start recording
      this.recorder.start();

      // Render frames
      return new Promise((resolve, reject) => {
        let currentFrame = 0;

        const renderNextFrame = async () => {
          if (currentFrame >= totalFrames) {
            // Finished rendering all frames
            this.recorder?.stop();
            return;
          }

          // Calculate time for this frame
          const frameTime = (currentFrame / (totalFrames - 1)) * settings.duration;

          // Render frame
          await ExportUtils.renderFrame(canvas, exportCanvas, frameTime, project, shapeRenderer);

          // Update progress
          if (currentFrame % 10 === 0) {
            onProgress?.({
              progress: 0.1 + (currentFrame / totalFrames) * 0.8,
              stage: 'render',
              message: `Rendering frame ${currentFrame + 1}/${totalFrames}...`,
              currentFrame: currentFrame + 1,
              totalFrames,
            });
          }

          currentFrame++;
          
          // Schedule next frame
          setTimeout(renderNextFrame, frameDelay);
        };

        // Handle recording completion
        this.recorder!.onstop = async () => {
          onProgress?.({
            progress: 0.9,
            stage: 'encode',
            message: 'Finalizing MP4...',
          });

          // Create final video blob
          const blob = new Blob(chunks, { type: 'video/mp4' });
          
          // Check if we need to remux for proper MP4 compatibility
          const finalBlob = await this.ensureProperMP4(blob);
          
          const filename = ExportUtils.generateFilename(`${project.name || 'animation'}`, 'mp4');

          onProgress?.({
            progress: 1,
            stage: 'complete',
            message: 'Export complete!',
          });

          resolve({
            success: true,
            data: finalBlob,
            url: URL.createObjectURL(finalBlob),
            filename,
            size: finalBlob.size,
            metadata: {
              width: settings.width,
              height: settings.height,
              fps: settings.fps,
              duration: settings.duration,
              bitrate: settings.bitrate,
              codec: mimeType,
            },
          });

          // Cleanup
          this.cleanup();
        };

        this.recorder!.onerror = (error) => {
          this.cleanup();
          reject(new ExportError(
            'Recording error: ' + error.toString(),
            'RECORDING_ERROR',
            this.id
          ));
        };

        // Start rendering frames
        renderNextFrame();
      });
    } catch (error) {
      this.cleanup();
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        filename: 'export-failed.mp4',
        error: errorMessage,
      };
    }
  }

  private getBestSupportedMimeType(): string | null {
    const types = [
      'video/mp4;codecs=h264',
      'video/webm;codecs=h264', // Some browsers support H.264 in WebM container
      'video/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return null;
  }

  private async ensureProperMP4(blob: Blob): Promise<Blob> {
    // For now, return the original blob
    // In a production environment, you might want to use mp4box.js
    // or a server-side service to ensure proper MP4 formatting
    return blob;
  }

  private cleanup(): void {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.recorder = null;
    this.stream = null;
  }

  cancel(): void {
    this.cleanup();
  }

  estimateExportTime(settings: any): number {
    // Real-time recording + encoding overhead
    return settings.duration + 3000;
  }

  getMemoryRequirements(settings: any): number {
    const baseMemory = super.getMemoryRequirements(settings);
    // Video encoding requires significant memory
    return baseMemory * 2;
  }

  getOptionsSchema(): Record<string, any> {
    return {
      quality: {
        type: 'number',
        min: 0.1,
        max: 1.0,
        step: 0.1,
        default: 0.8,
        label: 'Quality',
        description: 'Video quality (higher = better quality, larger file)',
      },
      fps: {
        type: 'number',
        min: 24,
        max: 60,
        step: 1,
        default: 30,
        label: 'Frame Rate',
        description: 'Frames per second',
      },
      bitrate: {
        type: 'number',
        min: 1000000,
        max: 20000000,
        step: 1000000,
        default: 5000000,
        label: 'Bitrate',
        description: 'Video bitrate in bits per second',
        format: 'bitrate',
      },
    };
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    return !!(
      window.MediaRecorder &&
      'captureStream' in HTMLCanvasElement.prototype &&
      this.getBestSupportedMimeType() !== null
    );
  }
}