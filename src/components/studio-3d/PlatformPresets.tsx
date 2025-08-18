'use client';

import { PLATFORM_PRESETS } from '@/lib/three/export-manager';

interface PlatformPresetsProps {
  onPresetSelect: (presetKey: string) => void;
  selectedPreset?: string;
}

const PLATFORM_INFO = {
  'instagram-story': {
    name: 'Instagram Story',
    icon: '📱',
    description: 'Vertical 9:16 format, 15s max',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  'instagram-post': {
    name: 'Instagram Post',
    icon: '📷',
    description: 'Square 1:1 format, 60s max',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  'youtube': {
    name: 'YouTube',
    icon: '▶️',
    description: 'Landscape 16:9, up to 5 min',
    color: 'bg-red-600',
  },
  'tiktok': {
    name: 'TikTok',
    icon: '🎵',
    description: 'Vertical 9:16, 60s max',
    color: 'bg-black',
  },
  'twitter': {
    name: 'Twitter',
    icon: '🐦',
    description: 'Landscape 16:9, 2:20 max',
    color: 'bg-blue-500',
  },
  'custom': {
    name: 'Custom',
    icon: '⚙️',
    description: 'Your own settings',
    color: 'bg-gray-600',
  },
};

export default function PlatformPresets({ onPresetSelect, selectedPreset }: PlatformPresetsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Platform Presets</h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(PLATFORM_INFO).map(([key, info]) => {
          const preset = PLATFORM_PRESETS[key];
          const isSelected = selectedPreset === key;
          
          return (
            <button
              key={key}
              onClick={() => onPresetSelect(key)}
              className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Platform Icon */}
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs ${info.color}`}>
                  {info.icon}
                </div>
                <span className="font-medium text-sm">{info.name}</span>
              </div>
              
              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {info.description}
              </p>
              
              {/* Technical Details */}
              {preset && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {preset.width}×{preset.height} • {preset.fps}fps
                  {preset.duration && ` • ${preset.duration}s max`}
                </div>
              )}
              
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Quick Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-1">💡 Pro Tips:</p>
          <ul className="space-y-1">
            <li>• Instagram: Square posts get more engagement</li>
            <li>• TikTok: First 3 seconds are crucial</li>
            <li>• YouTube: 16:9 prevents black bars</li>
            <li>• Twitter: Keep it under 30 seconds for better reach</li>
          </ul>
        </div>
      </div>
    </div>
  );
}