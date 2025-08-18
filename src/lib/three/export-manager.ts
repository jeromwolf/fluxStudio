import GIF from 'gif.js';
import { SceneManager } from './scene-manager';
import { TemplateCustomization } from './templates';

export interface ExportSettings3D {
  format: 'mp4' | 'webm' | 'gif' | 'png';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '720p' | '1080p' | '4k' | 'custom';
  width: number;
  height: number;
  fps: number;
  duration: number; // in seconds
  bitrate?: number; // for video formats
  transparent?: boolean; // for formats that support it
  loop?: boolean;
  platformPreset?: 'instagram-story' | 'instagram-post' | 'youtube' | 'tiktok' | 'twitter' | 'custom';
}

export interface ExportProgress3D {
  stage: 'preparing' | 'recording' | 'encoding' | 'finalizing' | 'complete' | 'error';
  progress: number; // 0-1
  currentFrame: number;
  totalFrames: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  message: string;
}

export interface ExportResult3D {
  success: boolean;
  blob?: Blob;
  url?: string;
  filename: string;
  fileSize?: number;
  duration: number;
  error?: string;
  metadata: {
    format: string;
    resolution: string;
    fps: number;
    fileSize: number;
    duration: number;
    quality: string;
  };
}

// Platform-specific presets
export const PLATFORM_PRESETS: Record<string, Partial<ExportSettings3D>> = {
  'instagram-story': {
    width: 1080,
    height: 1920,
    fps: 30,
    duration: 15,
    format: 'mp4',
    quality: 'high',
  },
  'instagram-post': {
    width: 1080,
    height: 1080,
    fps: 30,
    duration: 60,
    format: 'mp4',
    quality: 'high',
  },
  'youtube': {
    width: 1920,
    height: 1080,
    fps: 60,
    duration: 300,
    format: 'mp4',
    quality: 'ultra',
  },
  'tiktok': {
    width: 1080,
    height: 1920,
    fps: 30,
    duration: 60,
    format: 'mp4',
    quality: 'high',
  },
  'twitter': {
    width: 1280,
    height: 720,
    fps: 30,
    duration: 140,
    format: 'mp4',
    quality: 'medium',
  },
};

// Quality presets
export const QUALITY_PRESETS = {
  low: { bitrate: 1000, fps: 24 },
  medium: { bitrate: 2500, fps: 30 },
  high: { bitrate: 5000, fps: 30 },
  ultra: { bitrate: 8000, fps: 60 },
};

export class Export3DManager {
  private isExporting: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private onProgress?: (progress: ExportProgress3D) => void;
  private onComplete?: (result: ExportResult3D) => void;
  private startTime: number = 0;
  private currentFrame: number = 0;
  private totalFrames: number = 0;

  constructor(_sceneManager: SceneManager) {
    // We create our own off-screen managers for export, so we don't need to store the reference
  }

  /**
   * Export animation with specified settings
   */
  async export(
    templateId: string,
    customization: TemplateCustomization,
    settings: ExportSettings3D,
    onProgress?: (progress: ExportProgress3D) => void,
    onComplete?: (result: ExportResult3D) => void
  ): Promise<ExportResult3D> {
    if (this.isExporting) {
      throw new Error('Export already in progress');
    }

    this.isExporting = true;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.startTime = Date.now();
    this.currentFrame = 0;
    this.totalFrames = Math.ceil(settings.duration * settings.fps);

    try {
      // Apply platform preset if specified
      const finalSettings = this.applyPlatformPreset(settings);
      
      // Validate settings
      this.validateSettings(finalSettings);

      // Initialize export based on format
      let result: ExportResult3D;

      switch (finalSettings.format) {
        case 'mp4':
        case 'webm':
          result = await this.exportVideo(templateId, customization, finalSettings);
          break;
        case 'gif':
          result = await this.exportGIF(templateId, customization, finalSettings);
          break;
        case 'png':
          result = await this.exportPNG(templateId, customization, finalSettings);
          break;
        default:
          throw new Error(`Unsupported format: ${finalSettings.format}`);
      }

      this.onComplete?.(result);
      return result;

    } catch (error) {
      const errorResult: ExportResult3D = {
        success: false,
        filename: `export-error-${Date.now()}`,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          format: settings.format,
          resolution: `${settings.width}x${settings.height}`,
          fps: settings.fps,
          fileSize: 0,
          duration: 0,
          quality: settings.quality,
        },
      };

      this.onComplete?.(errorResult);
      return errorResult;
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Export as video (MP4/WebM)
   */
  private async exportVideo(
    templateId: string,
    customization: TemplateCustomization,
    settings: ExportSettings3D
  ): Promise<ExportResult3D> {
    this.updateProgress('preparing', 0, 'Setting up video recording...');

    // Create off-screen canvas for recording
    const canvas = document.createElement('canvas');
    canvas.width = settings.width;
    canvas.height = settings.height;
    
    // Create off-screen scene manager
    const offscreenSceneManager = new SceneManager(canvas);
    offscreenSceneManager.setCanvasSize(settings.width, settings.height);
    offscreenSceneManager.loadTemplate(templateId, customization);
    
    // Wait for template to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Check if MediaRecorder supports the format with codec
      let mimeType = '';
      let options: MediaRecorderOptions = {
        videoBitsPerSecond: QUALITY_PRESETS[settings.quality].bitrate * 1000,
      };
      
      if (settings.format === 'mp4') {
        // Try different MP4 codecs for better compatibility
        const mp4Codecs = [
          'video/mp4;codecs=h264',
          'video/mp4;codecs=avc1',
          'video/mp4;codecs="avc1.42E01E"',
          'video/mp4'
        ];
        
        for (const codec of mp4Codecs) {
          if (MediaRecorder.isTypeSupported(codec)) {
            mimeType = codec;
            options.mimeType = codec;
            break;
          }
        }
        
        if (!mimeType) {
          throw new Error('MP4 format not supported by browser. Try WebM instead.');
        }
      } else {
        // WebM with VP8/VP9 codec
        const webmCodecs = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm'
        ];
        
        for (const codec of webmCodecs) {
          if (MediaRecorder.isTypeSupported(codec)) {
            mimeType = codec;
            options.mimeType = codec;
            break;
          }
        }
        
        if (!mimeType) {
          throw new Error('WebM format not supported by browser');
        }
      }

      // Get canvas stream
      const stream = canvas.captureStream(settings.fps);
      
      // Setup MediaRecorder with options
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.recordedChunks = [];

      // Setup event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Start recording
      this.updateProgress('recording', 0, 'Recording animation...');
      this.mediaRecorder.start(); // Start continuous recording

      // Animate and render frames
      const startTime = Date.now();
      const frameDuration = 1000 / settings.fps;
      let frameCount = 0;
      
      // Start continuous animation
      offscreenSceneManager.startAnimation();
      
      // Record for the specified duration
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          this.mediaRecorder?.stop();
          offscreenSceneManager.stopAnimation();
          resolve();
        }, settings.duration * 1000);
        
        // Update progress during recording
        const updateInterval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min(elapsed / settings.duration, 1);
          this.currentFrame = Math.floor(progress * this.totalFrames);
          
          if (progress >= 1) {
            clearInterval(updateInterval);
            return;
          }
          
          this.updateProgress(
            'recording',
            progress,
            `Recording... ${Math.round(progress * 100)}%`,
            elapsed * 1000,
            (settings.duration - elapsed) * 1000
          );
        }, 100);
      });

      // Wait for recording to complete
      return new Promise((resolve) => {
        this.mediaRecorder!.onstop = () => {
          this.updateProgress('encoding', 0.8, 'Encoding video...');

          const blob = new Blob(this.recordedChunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const filename = this.generateFilename(templateId, settings.format);

          this.updateProgress('finalizing', 0.9, 'Finalizing export...');

          const result: ExportResult3D = {
            success: true,
            blob,
            url,
            filename,
            fileSize: blob.size,
            duration: settings.duration,
            metadata: {
              format: settings.format,
              resolution: `${settings.width}x${settings.height}`,
              fps: settings.fps,
              fileSize: blob.size,
              duration: settings.duration,
              quality: settings.quality,
            },
          };

          this.updateProgress('complete', 1, 'Export complete!');
          resolve(result);
        };
      });

    } finally {
      offscreenSceneManager.dispose();
    }
  }

  /**
   * Export as GIF
   */
  private async exportGIF(
    templateId: string,
    customization: TemplateCustomization,
    settings: ExportSettings3D
  ): Promise<ExportResult3D> {
    this.updateProgress('preparing', 0, 'Setting up GIF encoding...');

    // Create off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = settings.width;
    canvas.height = settings.height;
    
    const offscreenSceneManager = new SceneManager(canvas);
    offscreenSceneManager.setCanvasSize(settings.width, settings.height);
    offscreenSceneManager.loadTemplate(templateId, customization);
    
    // Wait for template to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Initialize GIF encoder
      const gif = new GIF({
        workers: 4,
        quality: settings.quality === 'low' ? 20 : settings.quality === 'medium' ? 10 : 5,
        width: settings.width,
        height: settings.height,
        repeat: settings.loop ? 0 : -1, // 0 = infinite loop, -1 = no loop
      });

      const frameDuration = 1000 / settings.fps;

      // Capture frames by rendering at specific times
      for (let i = 0; i < this.totalFrames; i++) {
        const currentTime = (i / settings.fps);
        
        // Render frame at specific time
        offscreenSceneManager.renderAtTime(currentTime);
        
        // Wait for render to complete
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Add frame to GIF
        gif.addFrame(canvas, { delay: frameDuration, copy: true });

        this.currentFrame++;
        const progress = this.currentFrame / this.totalFrames;
        this.updateProgress(
          'recording',
          progress * 0.7,
          `Capturing frame ${this.currentFrame} of ${this.totalFrames}`
        );
      }

      // Encode GIF
      this.updateProgress('encoding', 0.7, 'Encoding GIF...');

      return new Promise((resolve) => {
        gif.on('finished', (blob) => {
          const url = URL.createObjectURL(blob);
          const filename = this.generateFilename(templateId, 'gif');

          const result: ExportResult3D = {
            success: true,
            blob,
            url,
            filename,
            fileSize: blob.size,
            duration: settings.duration,
            metadata: {
              format: 'gif',
              resolution: `${settings.width}x${settings.height}`,
              fps: settings.fps,
              fileSize: blob.size,
              duration: settings.duration,
              quality: settings.quality,
            },
          };

          this.updateProgress('complete', 1, 'GIF export complete!');
          resolve(result);
        });

        gif.on('progress', (progress) => {
          this.updateProgress('encoding', 0.7 + (progress * 0.3), `Encoding GIF... ${Math.round(progress * 100)}%`);
        });

        gif.render();
      });

    } finally {
      offscreenSceneManager.dispose();
    }
  }

  /**
   * Export single frame as PNG
   */
  private async exportPNG(
    templateId: string,
    customization: TemplateCustomization,
    settings: ExportSettings3D
  ): Promise<ExportResult3D> {
    this.updateProgress('preparing', 0, 'Setting up PNG export...');

    // Create off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = settings.width;
    canvas.height = settings.height;
    
    const offscreenSceneManager = new SceneManager(canvas);
    offscreenSceneManager.setCanvasSize(settings.width, settings.height);
    offscreenSceneManager.loadTemplate(templateId, customization);
    
    // Wait for template to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      this.updateProgress('recording', 0.5, 'Rendering frame...');
      
      // Wait a moment for the scene to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Export frame
      const dataURL = offscreenSceneManager.exportFrame();
      const blob = this.dataURLToBlob(dataURL);
      const url = URL.createObjectURL(blob);
      const filename = this.generateFilename(templateId, 'png');

      this.updateProgress('complete', 1, 'PNG export complete!');

      return {
        success: true,
        blob,
        url,
        filename,
        fileSize: blob.size,
        duration: 0,
        metadata: {
          format: 'png',
          resolution: `${settings.width}x${settings.height}`,
          fps: 0,
          fileSize: blob.size,
          duration: 0,
          quality: settings.quality,
        },
      };

    } finally {
      offscreenSceneManager.dispose();
    }
  }

  /**
   * Apply platform preset to settings
   */
  private applyPlatformPreset(settings: ExportSettings3D): ExportSettings3D {
    if (settings.platformPreset && settings.platformPreset !== 'custom') {
      const preset = PLATFORM_PRESETS[settings.platformPreset];
      return { ...settings, ...preset };
    }
    return settings;
  }

  /**
   * Validate export settings
   */
  private validateSettings(settings: ExportSettings3D): void {
    if (settings.width <= 0 || settings.height <= 0) {
      throw new Error('Invalid dimensions');
    }
    if (settings.fps <= 0 || settings.fps > 120) {
      throw new Error('Invalid frame rate (1-120 fps)');
    }
    if (settings.duration <= 0) {
      throw new Error('Invalid duration');
    }
    if (settings.format === 'gif' && settings.duration > 30) {
      throw new Error('GIF duration limited to 30 seconds');
    }
  }

  /**
   * Update progress callback
   */
  private updateProgress(
    stage: ExportProgress3D['stage'],
    progress: number,
    message: string,
    elapsedTime?: number,
    estimatedTimeRemaining?: number
  ): void {
    const progressData: ExportProgress3D = {
      stage,
      progress: Math.min(Math.max(progress, 0), 1),
      currentFrame: this.currentFrame,
      totalFrames: this.totalFrames,
      elapsedTime: elapsedTime || Date.now() - this.startTime,
      estimatedTimeRemaining: estimatedTimeRemaining || 0,
      message,
    };

    this.onProgress?.(progressData);
  }

  /**
   * Generate filename with timestamp
   */
  private generateFilename(templateId: string, format: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `flux-studio-${templateId}-${timestamp}.${format}`;
  }

  /**
   * Convert data URL to blob
   */
  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Cancel ongoing export
   */
  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.isExporting = false;
  }

  /**
   * Check if currently exporting
   */
  get isExportInProgress(): boolean {
    return this.isExporting;
  }

  /**
   * Get supported formats for current browser
   */
  static getSupportedFormats(): string[] {
    const formats = ['png', 'gif'];
    
    // Check if we're in browser environment
    if (typeof window !== 'undefined' && 'MediaRecorder' in window) {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        formats.push('mp4');
      }
      if (MediaRecorder.isTypeSupported('video/webm')) {
        formats.push('webm');
      }
    }
    
    return formats;
  }

  /**
   * Estimate export file size
   */
  static estimateFileSize(settings: ExportSettings3D): number {
    const pixels = settings.width * settings.height;
    const duration = settings.duration;
    
    switch (settings.format) {
      case 'png':
        return pixels * 3; // Rough estimate for PNG
      case 'gif':
        const frames = duration * settings.fps;
        return pixels * frames * 0.1; // GIF compression estimate
      case 'mp4':
      case 'webm':
        const bitrate = QUALITY_PRESETS[settings.quality].bitrate * 1000;
        return (bitrate * duration) / 8; // Convert bits to bytes
      default:
        return 0;
    }
  }
}