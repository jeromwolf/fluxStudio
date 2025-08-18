'use client';

import { ExportSettings } from './base-plugin';

export interface PlatformPreset {
  id: string;
  name: string;
  platform: string;
  icon: string;
  description: string;
  settings: Partial<ExportSettings>;
  formats: string[]; // Supported export formats for this platform
  recommendations: {
    maxFileSize?: number; // in MB
    maxDuration?: number; // in seconds
    idealFormat: string;
    notes: string[];
  };
}

export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  'instagram-story': {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    icon: '📱',
    description: 'Vertical format optimized for Instagram Stories',
    settings: {
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 15000, // 15 seconds max
      quality: 0.85,
      loop: true,
    },
    formats: ['mp4', 'gif'],
    recommendations: {
      maxFileSize: 100, // 100MB
      maxDuration: 15,
      idealFormat: 'mp4',
      notes: [
        'Max 15 seconds for Stories',
        'Use 9:16 aspect ratio',
        'MP4 with H.264 codec recommended',
        'Keep file size under 100MB',
      ],
    },
  },
  'instagram-reel': {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    platform: 'Instagram',
    icon: '🎬',
    description: 'Vertical format for Instagram Reels',
    settings: {
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 30000, // 30 seconds default
      quality: 0.85,
    },
    formats: ['mp4'],
    recommendations: {
      maxFileSize: 200,
      maxDuration: 90, // 90 seconds max for Reels
      idealFormat: 'mp4',
      notes: [
        'Max 90 seconds for Reels',
        'Use 9:16 aspect ratio',
        'Add captions for better engagement',
        'MP4 with H.264 codec required',
      ],
    },
  },
  'instagram-post': {
    id: 'instagram-post',
    name: 'Instagram Post',
    platform: 'Instagram',
    icon: '📷',
    description: 'Square format for Instagram feed posts',
    settings: {
      width: 1080,
      height: 1080,
      fps: 30,
      duration: 60000, // 60 seconds max
      quality: 0.9,
    },
    formats: ['mp4', 'gif'],
    recommendations: {
      maxFileSize: 100,
      maxDuration: 60,
      idealFormat: 'mp4',
      notes: [
        'Max 60 seconds for feed videos',
        'Square (1:1) or vertical (4:5) recommended',
        'High quality for feed posts',
      ],
    },
  },
  'tiktok': {
    id: 'tiktok',
    name: 'TikTok Video',
    platform: 'TikTok',
    icon: '🎵',
    description: 'Vertical format optimized for TikTok',
    settings: {
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 60000, // 60 seconds default
      quality: 0.85,
    },
    formats: ['mp4', 'webm'],
    recommendations: {
      maxFileSize: 287, // 287MB max
      maxDuration: 180, // 3 minutes max
      idealFormat: 'mp4',
      notes: [
        'Max 3 minutes (10 minutes for some accounts)',
        'Use 9:16 aspect ratio',
        'MP4 or MOV format',
        'Keep first 3 seconds engaging',
      ],
    },
  },
  'youtube': {
    id: 'youtube',
    name: 'YouTube Video',
    platform: 'YouTube',
    icon: '▶️',
    description: 'Landscape format for YouTube',
    settings: {
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 300000, // 5 minutes default
      quality: 0.9,
      bitrate: 8000000, // 8 Mbps for 1080p
    },
    formats: ['mp4', 'webm'],
    recommendations: {
      maxFileSize: 128000, // 128GB max
      maxDuration: 43200, // 12 hours max
      idealFormat: 'mp4',
      notes: [
        'Use 16:9 aspect ratio',
        'MP4 with H.264 codec recommended',
        '1080p or higher for best quality',
        'Higher bitrate for better quality',
      ],
    },
  },
  'youtube-shorts': {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    platform: 'YouTube',
    icon: '📹',
    description: 'Vertical format for YouTube Shorts',
    settings: {
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 60000, // 60 seconds max
      quality: 0.85,
    },
    formats: ['mp4', 'webm'],
    recommendations: {
      maxFileSize: 100,
      maxDuration: 60,
      idealFormat: 'mp4',
      notes: [
        'Max 60 seconds for Shorts',
        'Use 9:16 aspect ratio',
        'Add #Shorts to title or description',
        'Loop-friendly content works best',
      ],
    },
  },
  'twitter': {
    id: 'twitter',
    name: 'Twitter/X Video',
    platform: 'Twitter',
    icon: '🐦',
    description: 'Optimized for Twitter/X timeline',
    settings: {
      width: 1280,
      height: 720,
      fps: 30,
      duration: 140000, // 2:20 max
      quality: 0.8,
      bitrate: 2000000, // 2 Mbps
    },
    formats: ['mp4', 'gif'],
    recommendations: {
      maxFileSize: 512,
      maxDuration: 140, // 2:20 max
      idealFormat: 'mp4',
      notes: [
        'Max 2:20 duration',
        'MP4 with H.264 codec',
        '16:9 or 1:1 aspect ratio',
        'GIFs auto-play in timeline',
      ],
    },
  },
  'linkedin': {
    id: 'linkedin',
    name: 'LinkedIn Video',
    platform: 'LinkedIn',
    icon: '💼',
    description: 'Professional format for LinkedIn',
    settings: {
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 600000, // 10 minutes max
      quality: 0.85,
    },
    formats: ['mp4'],
    recommendations: {
      maxFileSize: 5000, // 5GB max
      maxDuration: 600, // 10 minutes
      idealFormat: 'mp4',
      notes: [
        'Max 10 minutes duration',
        'MP4 format required',
        'Add captions for accessibility',
        'Professional content performs best',
      ],
    },
  },
  'facebook': {
    id: 'facebook',
    name: 'Facebook Video',
    platform: 'Facebook',
    icon: '👥',
    description: 'Optimized for Facebook feed',
    settings: {
      width: 1280,
      height: 720,
      fps: 30,
      duration: 240000, // 4 minutes recommended
      quality: 0.85,
    },
    formats: ['mp4', 'gif'],
    recommendations: {
      maxFileSize: 4000, // 4GB max
      maxDuration: 240, // 4 minutes recommended
      idealFormat: 'mp4',
      notes: [
        'Square (1:1) or vertical (4:5) for mobile',
        'Add captions (85% watch without sound)',
        'First 3 seconds are crucial',
        'MP4 or MOV format',
      ],
    },
  },
  'web-banner': {
    id: 'web-banner',
    name: 'Web Banner',
    platform: 'Web',
    icon: '🌐',
    description: 'Animated banner for websites',
    settings: {
      width: 728,
      height: 90,
      fps: 24,
      duration: 10000, // 10 seconds
      quality: 0.7,
      loop: true,
    },
    formats: ['gif', 'webm'],
    recommendations: {
      maxFileSize: 1, // Keep small for web
      maxDuration: 15,
      idealFormat: 'gif',
      notes: [
        'Keep file size minimal',
        'Use GIF for compatibility',
        'WebM for better quality',
        'Ensure smooth looping',
      ],
    },
  },
  'presentation': {
    id: 'presentation',
    name: 'Presentation',
    platform: 'PowerPoint/Keynote',
    icon: '📊',
    description: 'For embedding in presentations',
    settings: {
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 30000, // 30 seconds
      quality: 0.9,
    },
    formats: ['mp4', 'gif'],
    recommendations: {
      maxFileSize: 100,
      maxDuration: 60,
      idealFormat: 'mp4',
      notes: [
        'Use 16:9 for full screen',
        'MP4 for best compatibility',
        'Keep animations concise',
        'Test in presentation software',
      ],
    },
  },
  'custom': {
    id: 'custom',
    name: 'Custom Export',
    platform: 'Custom',
    icon: '⚙️',
    description: 'Custom settings for any platform',
    settings: {
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 60000,
      quality: 0.85,
    },
    formats: ['mp4', 'webm', 'gif', 'png'],
    recommendations: {
      idealFormat: 'mp4',
      notes: [
        'Adjust settings as needed',
        'Check platform requirements',
        'Test before final export',
      ],
    },
  },
};

// Helper function to get preset by platform
export function getPresetsByPlatform(platform: string): PlatformPreset[] {
  return Object.values(PLATFORM_PRESETS).filter(
    preset => preset.platform.toLowerCase() === platform.toLowerCase()
  );
}

// Helper function to get optimal format for a preset
export function getOptimalFormat(presetId: string): string {
  const preset = PLATFORM_PRESETS[presetId];
  return preset?.recommendations.idealFormat || 'mp4';
}

// Helper function to validate settings against platform limits
export function validatePlatformSettings(
  presetId: string,
  settings: ExportSettings
): { valid: boolean; errors: string[] } {
  const preset = PLATFORM_PRESETS[presetId];
  if (!preset) return { valid: true, errors: [] };

  const errors: string[] = [];
  const recommendations = preset.recommendations;

  if (recommendations.maxDuration && settings.duration > recommendations.maxDuration * 1000) {
    errors.push(`Duration exceeds platform limit of ${recommendations.maxDuration} seconds`);
  }

  if (recommendations.maxFileSize) {
    // This would need to be checked after export
    // Could estimate based on bitrate and duration
  }

  if (!preset.formats.includes(settings.format)) {
    errors.push(`Format ${settings.format} not supported for ${preset.platform}`);
  }

  return { valid: errors.length === 0, errors };
}