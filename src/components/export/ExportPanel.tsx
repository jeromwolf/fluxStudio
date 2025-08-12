'use client';

import React, { useState, useEffect } from 'react';

import { ExportPlugin, ExportSettings } from '@/lib/export-system/base-plugin';
import { exportRegistry } from '@/lib/export-system/plugin-registry';
import { GifExportPlugin } from '@/lib/export-system/plugins/gif-export';
import { PngExportPlugin } from '@/lib/export-system/plugins/png-export';
import { useAnimationStore } from '@/lib/stores/animation-store';

interface ExportPanelProps {
  className?: string;
}

interface ExportJobStatus {
  id: string;
  plugin: string;
  progress: number;
  stage: string;
  message: string;
  status: 'running' | 'completed' | 'failed';
  filename?: string;
  size?: number;
  error?: string;
}

export default function ExportPanel({ className = '' }: ExportPanelProps) {
  const { project } = useAnimationStore();
  const [selectedFormat, setSelectedFormat] = useState<string>('png');
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    width: 1920,
    height: 1080,
    fps: 30,
    duration: project.duration,
    quality: 0.9,
    transparent: true,
  });
  const [activeJobs, setActiveJobs] = useState<ExportJobStatus[]>([]);
  const [plugins, setPlugins] = useState<ExportPlugin[]>([]);

  // Initialize plugins
  useEffect(() => {
    // Register built-in plugins
    exportRegistry.register(new PngExportPlugin(), 10);
    exportRegistry.register(new GifExportPlugin(), 5);

    setPlugins(exportRegistry.getPlugins());
  }, []);

  // Update duration when project changes
  useEffect(() => {
    setExportSettings((prev) => ({
      ...prev,
      duration: project.duration,
    }));
  }, [project.duration]);

  const selectedPlugin = plugins.find((p) => p.id === selectedFormat);

  const handleFormatChange = (formatId: string) => {
    const plugin = plugins.find((p) => p.id === formatId);
    if (!plugin) return;

    setSelectedFormat(formatId);
    setExportSettings((prev) => ({
      ...prev,
      format: formatId,
      ...plugin.defaultSettings,
    }));
  };

  const handleSettingChange = (key: string, value: any) => {
    setExportSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExport = async () => {
    if (!selectedPlugin) return;

    // Get canvas element (this would need to be passed down or accessed differently)
    const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvasElement) {
      alert('Canvas not found');
      return;
    }

    const canvas2d = canvasElement.getContext('2d');
    if (!canvas2d) {
      alert('Cannot get 2D context');
      return;
    }

    // Create export job
    const jobId = exportRegistry.createJob(selectedFormat, {
      canvas: canvasElement,
      context: canvas2d,
      project,
      settings: exportSettings,
      onProgress: (progress) => {
        setActiveJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  progress: progress.progress,
                  stage: progress.stage,
                  message: progress.message,
                }
              : job
          )
        );
      },
      onComplete: (result) => {
        setActiveJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'completed',
                  progress: 1,
                  filename: result.filename,
                  size: result.size,
                }
              : job
          )
        );

        // Auto-download
        if (result.success && result.data) {
          const link = document.createElement('a');
          if (result.url) {
            link.href = result.url;
          } else if (result.data instanceof Blob) {
            link.href = URL.createObjectURL(result.data);
          }
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          if (result.url) {
            setTimeout(() => URL.revokeObjectURL(result.url!), 60000);
          }
        }
      },
      onError: (error) => {
        setActiveJobs((prev) =>
          prev.map((job) => (job.id === jobId ? { ...job, status: 'failed', error } : job))
        );
      },
    });

    // Add job to tracking
    setActiveJobs((prev) => [
      ...prev,
      {
        id: jobId,
        plugin: selectedFormat,
        progress: 0,
        stage: 'starting',
        message: 'Starting export...',
        status: 'running',
      },
    ]);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getPresetDimensions = (preset: string) => {
    const presets: Record<string, { width: number; height: number }> = {
      hd: { width: 1280, height: 720 },
      fhd: { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 },
      square: { width: 1080, height: 1080 },
      portrait: { width: 1080, height: 1920 },
      twitter: { width: 1200, height: 675 },
      instagram: { width: 1080, height: 1080 },
    };
    return presets[preset];
  };

  return (
    <div className={`bg-gray-800 p-4 text-white ${className}`}>
      <h2 className="mb-4 text-lg font-semibold">Export Animation</h2>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Format</label>
        <select
          value={selectedFormat}
          onChange={(e) => handleFormatChange(e.target.value)}
          className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2"
        >
          {plugins.map((plugin) => (
            <option key={plugin.id} value={plugin.id}>
              {plugin.name} ({plugin.fileExtension.toUpperCase()})
            </option>
          ))}
        </select>
        {selectedPlugin && (
          <p className="mt-1 text-xs text-gray-400">{selectedPlugin.description}</p>
        )}
      </div>

      {/* Dimensions */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Dimensions</label>
        <div className="mb-2 flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={exportSettings.width}
              onChange={(e) => handleSettingChange('width', parseInt(e.target.value))}
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2"
              placeholder="Width"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={exportSettings.height}
              onChange={(e) => handleSettingChange('height', parseInt(e.target.value))}
              className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2"
              placeholder="Height"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {['hd', 'fhd', '4k', 'square', 'portrait'].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                const dims = getPresetDimensions(preset);
                if (dims) {
                  handleSettingChange('width', dims.width);
                  handleSettingChange('height', dims.height);
                }
              }}
              className="rounded bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600"
            >
              {preset.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Format-specific options */}
      {selectedPlugin && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Options</label>

          {selectedPlugin.supportsAnimation && (
            <div className="mb-2">
              <label className="mb-1 block text-xs text-gray-400">Frame Rate (FPS)</label>
              <input
                type="number"
                value={exportSettings.fps}
                onChange={(e) => handleSettingChange('fps', parseInt(e.target.value))}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-1"
                min="1"
                max="60"
              />
            </div>
          )}

          {selectedPlugin.id === 'gif' && (
            <div className="mb-2">
              <label className="mb-1 block text-xs text-gray-400">
                Quality (1-20, lower = better)
              </label>
              <input
                type="number"
                value={exportSettings.quality}
                onChange={(e) => handleSettingChange('quality', parseInt(e.target.value))}
                className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-1"
                min="1"
                max="20"
              />
            </div>
          )}

          {selectedPlugin.supportsTransparency && (
            <div className="mb-2">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={exportSettings.transparent}
                  onChange={(e) => handleSettingChange('transparent', e.target.checked)}
                  className="mr-2"
                />
                Transparent Background
              </label>
            </div>
          )}
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={activeJobs.some((job) => job.status === 'running')}
        className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-600"
      >
        {activeJobs.some((job) => job.status === 'running') ? 'Exporting...' : 'Export'}
      </button>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium">Export Jobs</h3>
          <div className="space-y-2">
            {activeJobs.map((job) => (
              <div key={job.id} className="rounded bg-gray-700 p-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{job.plugin.toUpperCase()} Export</span>
                  <span className="text-xs text-gray-400">{Math.round(job.progress * 100)}%</span>
                </div>

                <div className="mb-2 h-2 w-full rounded-full bg-gray-600">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${job.progress * 100}%` }}
                  />
                </div>

                <div className="text-xs text-gray-400">{job.message}</div>

                {job.status === 'completed' && (
                  <div className="mt-1 text-xs text-green-400">
                    ✓ Completed: {job.filename} {job.size && `(${formatFileSize(job.size)})`}
                  </div>
                )}

                {job.status === 'failed' && (
                  <div className="mt-1 text-xs text-red-400">✗ Failed: {job.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
