'use client';

import { exportRegistry } from './plugin-registry';
import { registerExportPlugins } from './plugins';
import { ExportContext, ExportSettings, ExportResult } from './base-plugin';
import { PLATFORM_PRESETS, validatePlatformSettings, getOptimalFormat } from './platform-presets';
import { AnimationProject } from '../stores/animation-store';

// Initialize plugins
let pluginsRegistered = false;
if (!pluginsRegistered && typeof window !== 'undefined') {
  registerExportPlugins();
  pluginsRegistered = true;
}

export interface UnifiedExportOptions {
  project: AnimationProject;
  canvas: HTMLCanvasElement;
  presetId?: string;
  customSettings?: Partial<ExportSettings>;
  onProgress?: (progress: any) => void;
  onComplete?: (result: ExportResult) => void;
  onError?: (error: string) => void;
}

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Export animation with unified interface
   */
  async export(options: UnifiedExportOptions): Promise<string> {
    const { project, canvas, presetId, customSettings, onProgress, onComplete, onError } = options;

    try {
      // Get settings from preset or custom
      const settings = this.getExportSettings(presetId, customSettings);
      
      // Validate against platform requirements
      if (presetId) {
        const validation = validatePlatformSettings(presetId, settings);
        if (!validation.valid) {
          throw new Error(`Platform validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Get appropriate plugin
      const plugin = exportRegistry.getPlugin(settings.format);
      if (!plugin) {
        throw new Error(`No plugin available for format: ${settings.format}`);
      }

      // Create export context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Cannot get canvas context');
      }

      const context: ExportContext = {
        canvas,
        context: ctx,
        project,
        settings,
        onProgress,
        onComplete,
        onError,
      };

      // Create export job
      const jobId = exportRegistry.createJob(plugin.id, context);
      
      return jobId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Get export settings from preset or custom
   */
  private getExportSettings(presetId?: string, customSettings?: Partial<ExportSettings>): ExportSettings {
    let baseSettings: ExportSettings = {
      format: 'mp4',
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 5000,
      quality: 0.85,
    };

    // Apply preset if specified
    if (presetId && PLATFORM_PRESETS[presetId]) {
      const preset = PLATFORM_PRESETS[presetId];
      const optimalFormat = getOptimalFormat(presetId);
      
      baseSettings = {
        ...baseSettings,
        ...preset.settings,
        format: optimalFormat,
      };
    }

    // Apply custom settings
    if (customSettings) {
      baseSettings = {
        ...baseSettings,
        ...customSettings,
      };
    }

    return baseSettings;
  }

  /**
   * Quick export with platform preset
   */
  async quickExport(
    project: AnimationProject,
    canvas: HTMLCanvasElement,
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
  ): Promise<ExportResult> {
    // Map platform to preset
    const presetMap = {
      instagram: 'instagram-reel',
      tiktok: 'tiktok',
      youtube: 'youtube',
      twitter: 'twitter',
    };

    const presetId = presetMap[platform];
    
    return new Promise((resolve, reject) => {
      this.export({
        project,
        canvas,
        presetId,
        onComplete: resolve,
        onError: (error) => reject(new Error(error)),
      });
    });
  }

  /**
   * Export with multiple formats
   */
  async batchExport(
    project: AnimationProject,
    canvas: HTMLCanvasElement,
    formats: string[],
    baseSettings?: Partial<ExportSettings>
  ): Promise<Map<string, ExportResult>> {
    const results = new Map<string, ExportResult>();
    
    for (const format of formats) {
      try {
        const result = await new Promise<ExportResult>((resolve, reject) => {
          this.export({
            project,
            canvas,
            customSettings: {
              ...baseSettings,
              format,
            },
            onComplete: resolve,
            onError: (error) => reject(new Error(error)),
          });
        });
        
        results.set(format, result);
      } catch (error) {
        results.set(format, {
          success: false,
          filename: `export-failed.${format}`,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    
    return results;
  }

  /**
   * Get export job status
   */
  getJobStatus(jobId: string) {
    return exportRegistry.getJob(jobId);
  }

  /**
   * Cancel export job
   */
  cancelExport(jobId: string): boolean {
    return exportRegistry.cancelJob(jobId);
  }

  /**
   * Get all running exports
   */
  getRunningExports() {
    return exportRegistry.getJobsByStatus('running');
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): string[] {
    return exportRegistry.getPlugins().map(p => p.id);
  }

  /**
   * Get format capabilities
   */
  getFormatCapabilities(format: string) {
    const plugin = exportRegistry.getPlugin(format);
    if (!plugin) return null;

    return {
      supportsTransparency: plugin.supportsTransparency,
      supportsAnimation: plugin.supportsAnimation,
      maxDuration: plugin.maxDuration,
      category: plugin.category,
      optionsSchema: plugin.getOptionsSchema(),
    };
  }

  /**
   * Estimate export time and size
   */
  estimateExport(format: string, settings: ExportSettings) {
    const plugin = exportRegistry.getPlugin(format);
    if (!plugin) return null;

    return {
      estimatedTime: plugin.estimateExportTime(settings),
      estimatedSize: plugin.getMemoryRequirements(settings),
      errors: plugin.validate(settings),
    };
  }

  /**
   * Get platform recommendations
   */
  getPlatformRecommendations(platform: string) {
    const presets = Object.values(PLATFORM_PRESETS).filter(
      p => p.platform.toLowerCase() === platform.toLowerCase()
    );
    
    return presets.map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      recommendations: preset.recommendations,
      settings: preset.settings,
    }));
  }
}

// Export singleton instance
export const exportService = ExportService.getInstance();