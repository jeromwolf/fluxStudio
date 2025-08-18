'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Export3DManager, ExportSettings3D, ExportProgress3D, ExportResult3D, PLATFORM_PRESETS } from '@/lib/three/export-manager';
import { Template3D, TemplateCustomization } from '@/lib/three/templates';
import { SceneManager } from '@/lib/three/scene-manager';
import PlatformPresets from './PlatformPresets';
import ExportProgress from './ExportProgress';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template3D | null;
  customization: TemplateCustomization;
  sceneManager: SceneManager | null;
}

const RESOLUTION_PRESETS = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
  'custom': { width: 1920, height: 1080 },
};

const FORMAT_INFO = {
  mp4: {
    name: 'MP4 Video',
    description: 'Best for social media and web sharing',
    maxSize: '500MB',
    platforms: ['YouTube', 'Instagram', 'Twitter', 'TikTok'],
  },
  webm: {
    name: 'WebM Video',
    description: 'Open format, great for web embedding',
    maxSize: '500MB',
    platforms: ['Web', 'Chrome', 'Firefox'],
  },
  gif: {
    name: 'Animated GIF',
    description: 'Universal support, larger file sizes',
    maxSize: '50MB',
    platforms: ['All platforms', 'Email', 'Slack'],
  },
  png: {
    name: 'PNG Image',
    description: 'Single frame, perfect quality',
    maxSize: '20MB',
    platforms: ['All platforms', 'Print', 'Web'],
  },
};

export default function ExportPanel({ isOpen, onClose, template, customization, sceneManager }: ExportPanelProps) {
  const [settings, setSettings] = useState<ExportSettings3D>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 8,
    transparent: false,
    loop: true,
    platformPreset: 'custom',
  });

  const [exportManager, setExportManager] = useState<Export3DManager | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress3D | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult3D | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<string>('');

  // Create export manager when sceneManager becomes available
  useEffect(() => {
    if (sceneManager) {
      setExportManager(new Export3DManager(sceneManager));
    }
  }, [sceneManager]);

  // Keep duration at 8 seconds regardless of template
  useEffect(() => {
    if (template) {
      setSettings(prev => ({ ...prev, duration: 8 }));
    }
  }, [template]);

  // Update resolution when preset changes
  useEffect(() => {
    if (settings.resolution !== 'custom') {
      const resolution = RESOLUTION_PRESETS[settings.resolution];
      setSettings(prev => ({ ...prev, width: resolution.width, height: resolution.height }));
    }
  }, [settings.resolution]);

  // Update settings when platform preset changes
  useEffect(() => {
    if (settings.platformPreset && settings.platformPreset !== 'custom') {
      const preset = PLATFORM_PRESETS[settings.platformPreset];
      setSettings(prev => ({ ...prev, ...preset }));
    }
  }, [settings.platformPreset]);

  // Estimate file size
  useEffect(() => {
    const sizeBytes = Export3DManager.estimateFileSize(settings);
    const sizeMB = sizeBytes / (1024 * 1024);
    
    if (sizeMB < 1) {
      setEstimatedSize(`${Math.round(sizeMB * 1024)} KB`);
    } else if (sizeMB < 1000) {
      setEstimatedSize(`${sizeMB.toFixed(1)} MB`);
    } else {
      setEstimatedSize(`${(sizeMB / 1024).toFixed(1)} GB`);
    }
  }, [settings]);

  const handleExport = async () => {
    if (!exportManager) {
      console.error('Export manager not initialized. Scene manager might not be ready.');
      setExportResult({
        success: false,
        filename: 'export-failed',
        duration: 0,
        error: 'Export system not ready. Please try again.',
        metadata: {
          format: settings.format,
          resolution: `${settings.width}x${settings.height}`,
          fps: settings.fps,
          fileSize: 0,
          duration: 0,
          quality: settings.quality,
        },
      });
      return;
    }
    
    if (!template) {
      console.error('No template selected');
      return;
    }

    setIsExporting(true);
    setExportProgress(null);
    setExportResult(null);

    try {
      const result = await exportManager.export(
        template.id,
        customization,
        settings,
        (progress) => setExportProgress(progress),
        (result) => setExportResult(result)
      );

      if (result.success && result.url) {
        // Auto-download the file
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportResult({
        success: false,
        filename: 'export-failed',
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
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(mb * 1024)} KB` : `${mb.toFixed(1)} MB`;
  };

  const supportedFormats = Export3DManager.getSupportedFormats();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Export Animation
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {template && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Template: {template.name}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {supportedFormats.map((format) => (
                    <button
                      key={format}
                      onClick={() => setSettings(prev => ({ ...prev, format: format as any }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        settings.format === format
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {FORMAT_INFO[format as keyof typeof FORMAT_INFO].name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {FORMAT_INFO[format as keyof typeof FORMAT_INFO].description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Presets */}
              <PlatformPresets
                onPresetSelect={(preset) => setSettings(prev => ({ ...prev, platformPreset: preset as any }))}
                selectedPreset={settings.platformPreset}
              />

              {/* Quality Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Quality
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => setSettings(prev => ({ ...prev, quality }))}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        settings.quality === quality
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-sm capitalize">{quality}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Resolution
                </label>
                <select
                  value={settings.resolution}
                  onChange={(e) => setSettings(prev => ({ ...prev, resolution: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="720p">720p (1280×720)</option>
                  <option value="1080p">1080p (1920×1080)</option>
                  <option value="4k">4K (3840×2160)</option>
                  <option value="custom">Custom</option>
                </select>

                {settings.resolution === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Width</label>
                      <input
                        type="number"
                        value={settings.width}
                        onChange={(e) => setSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 1920 }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Height</label>
                      <input
                        type="number"
                        value={settings.height}
                        onChange={(e) => setSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 1080 }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Duration & FPS */}
              {settings.format !== 'png' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={settings.format === 'gif' ? 30 : 300}
                      value={settings.duration}
                      onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) || 8 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Frame Rate
                    </label>
                    <select
                      value={settings.fps}
                      onChange={(e) => setSettings(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={24}>24 FPS</option>
                      <option value={30}>30 FPS</option>
                      <option value={60}>60 FPS</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Options */}
              {(settings.format === 'gif' || settings.format === 'webm') && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.loop}
                      onChange={(e) => setSettings(prev => ({ ...prev, loop: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">Loop animation</span>
                  </label>
                </div>
              )}

              {/* Export Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Export Info</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <span>{settings.width}×{settings.height}</span>
                  </div>
                  {settings.format !== 'png' && (
                    <>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{formatTime(settings.duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Frames:</span>
                        <span>{Math.ceil(settings.duration * settings.fps)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Size:</span>
                    <span>{estimatedSize}</span>
                  </div>
                </div>
              </div>

              {/* Export Progress */}
              {isExporting && exportProgress && (
                <ExportProgress
                  progress={exportProgress}
                  onCancel={() => {
                    exportManager?.cancel();
                    setIsExporting(false);
                    setExportProgress(null);
                  }}
                />
              )}

              {/* Export Result */}
              {exportResult && (
                <div className={`rounded-lg p-4 ${
                  exportResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {exportResult.success ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className="font-medium">
                      {exportResult.success ? 'Export Successful!' : 'Export Failed'}
                    </span>
                  </div>
                  {exportResult.success ? (
                    <div className="text-sm">
                      <p>File: {exportResult.filename}</p>
                      {exportResult.fileSize && (
                        <p>Size: {formatFileSize(exportResult.fileSize)}</p>
                      )}
                      <p className="text-xs mt-1">Download should start automatically</p>
                    </div>
                  ) : (
                    <p className="text-sm">{exportResult.error}</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={!template || !exportManager || isExporting}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isExporting ? 'Exporting...' : !exportManager ? 'Loading...' : 'Export'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}