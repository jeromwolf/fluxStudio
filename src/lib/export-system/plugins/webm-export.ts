'use client';

import { ShapeRenderer } from '../../animation-engine/shapes';
import {
  ExportPlugin,
  ExportContext,
  ExportResult,
  ExportUtils,
  ExportError,
} from '../base-plugin';

export class WebMExportPlugin extends ExportPlugin {
  readonly id = 'webm';
  readonly name = 'WebM Video';
  readonly description = 'Export as WebM video with VP8/VP9 codec for web playback';
  readonly fileExtension = 'webm';
  readonly mimeType = 'video/webm';
  readonly category = 'video';
  readonly supportsTransparency = true; // WebM supports alpha channel
  readonly supportsAnimation = true;
  readonly maxDuration = 600000; // 10 minutes max
  readonly defaultSettings = {
    quality: 0.85,
    fps: 30,
    bitrate: 4000000, // 4 Mbps
    codec: 'vp9', // vp8 or vp9
    transparent: false,
  };

  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  async export(context: ExportContext): Promise<ExportResult> {
    const { canvas, project, settings, onProgress } = context;

    try {
      onProgress?.({
        progress: 0,
        stage: 'setup',
        message: 'Setting up WebM export...',
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

      // Create export canvas
      const exportCanvas = ExportUtils.createCanvas(settings.width, settings.height);
      const exportCtx = exportCanvas.getContext('2d', { alpha: settings.transparent });
      if (!exportCtx) {
        throw new ExportError('Cannot get canvas context', 'CONTEXT_ERROR', this.id);
      }

      // Capture stream from canvas
      this.stream = exportCanvas.captureStream(settings.fps);
      
      // Determine codec and MIME type
      const mimeType = this.getBestSupportedMimeType(settings.codec || 'vp9');
      if (!mimeType) {
        throw new ExportError('WebM encoding not supported in this browser', 'UNSUPPORTED', this.id);
      }

      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: settings.bitrate || 4000000,
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
      let frameStartTime = performance.now();

      onProgress?.({
        progress: 0.1,
        stage: 'render',
        message: 'Rendering video frames...',
        totalFrames,
        currentFrame: 0,
      });

      // Create shape renderer
      const shapeRenderer = new ShapeRenderer();

      // Start recording with timeslice for better memory management
      this.recorder.start(1000); // Get data every second

      // Render frames
      return new Promise((resolve, reject) => {
        let currentFrame = 0;
        let animationFrameId: number;

        const renderNextFrame = async () => {
          if (currentFrame >= totalFrames) {
            // Finished rendering all frames
            this.recorder?.stop();
            return;
          }

          const now = performance.now();
          const elapsed = now - frameStartTime;

          // Only render if enough time has passed for the next frame
          if (elapsed >= frameDelay) {
            frameStartTime = now;

            // Calculate time for this frame
            const frameTime = (currentFrame / Math.max(1, totalFrames - 1)) * settings.duration;

            // Clear canvas if transparent
            if (settings.transparent) {
              exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
            }

            // Render frame
            await ExportUtils.renderFrame(canvas, exportCanvas, frameTime, project, shapeRenderer);

            // Update progress
            if (currentFrame % 10 === 0 || currentFrame === totalFrames - 1) {
              onProgress?.({
                progress: 0.1 + (currentFrame / totalFrames) * 0.8,
                stage: 'render',
                message: `Rendering frame ${currentFrame + 1}/${totalFrames}...`,
                currentFrame: currentFrame + 1,
                totalFrames,
                estimatedTimeRemaining: ((totalFrames - currentFrame) * frameDelay) / 1000,
              });
            }

            currentFrame++;
          }

          // Continue rendering
          animationFrameId = requestAnimationFrame(renderNextFrame);
        };

        // Handle recording completion
        this.recorder!.onstop = async () => {
          cancelAnimationFrame(animationFrameId);

          onProgress?.({
            progress: 0.9,
            stage: 'encode',
            message: 'Finalizing WebM...',
          });

          // Create final video blob
          const blob = new Blob(chunks, { type: mimeType });
          const filename = ExportUtils.generateFilename(`${project.name || 'animation'}`, 'webm');

          onProgress?.({
            progress: 1,
            stage: 'complete',
            message: 'Export complete!',
          });

          resolve({
            success: true,
            data: blob,
            url: URL.createObjectURL(blob),
            filename,
            size: blob.size,
            metadata: {
              width: settings.width,
              height: settings.height,
              fps: settings.fps,
              duration: settings.duration,
              bitrate: settings.bitrate,
              codec: mimeType,
              transparent: settings.transparent,
            },
          });

          // Cleanup
          this.cleanup();
        };

        this.recorder!.onerror = (error) => {
          cancelAnimationFrame(animationFrameId);
          this.cleanup();
          reject(new ExportError(
            'Recording error: ' + error.toString(),
            'RECORDING_ERROR',
            this.id
          ));
        };

        // Start rendering frames
        animationFrameId = requestAnimationFrame(renderNextFrame);
      });
    } catch (error) {
      this.cleanup();
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        filename: 'export-failed.webm',
        error: errorMessage,
      };
    }
  }

  private getBestSupportedMimeType(preferredCodec: string): string | null {
    const types = preferredCodec === 'vp8' 
      ? [
          'video/webm;codecs=vp8',
          'video/webm;codecs=vp9',
          'video/webm',
        ]
      : [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
        ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return null;
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
    // Real-time recording + minimal encoding overhead (WebM is efficient)
    return settings.duration + 2000;
  }

  getMemoryRequirements(settings: any): number {
    const baseMemory = super.getMemoryRequirements(settings);
    // WebM encoding is more memory efficient than MP4
    return baseMemory * 1.5;
  }

  getOptionsSchema(): Record<string, any> {
    return {
      quality: {
        type: 'number',
        min: 0.1,
        max: 1.0,
        step: 0.05,
        default: 0.85,
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
        min: 500000,
        max: 15000000,
        step: 500000,
        default: 4000000,
        label: 'Bitrate',
        description: 'Video bitrate in bits per second',
        format: 'bitrate',
      },
      codec: {
        type: 'select',
        options: [
          { value: 'vp9', label: 'VP9 (Better compression)' },
          { value: 'vp8', label: 'VP8 (Better compatibility)' },
        ],
        default: 'vp9',
        label: 'Codec',
        description: 'Video codec to use',
      },
      transparent: {
        type: 'boolean',
        default: false,
        label: 'Transparent Background',
        description: 'Export with alpha channel (larger file size)',
      },
    };
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    return !!(
      window.MediaRecorder &&
      'captureStream' in HTMLCanvasElement.prototype &&
      this.getBestSupportedMimeType('vp9') !== null
    );
  }
}