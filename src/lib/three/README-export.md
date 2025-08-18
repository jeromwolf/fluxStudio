# 3D Animation Export System

This document describes the 3D animation export functionality implemented for Flux Studio.

## Overview

The export system allows users to export their customized 3D animations in multiple formats optimized for different platforms and use cases.

## Supported Formats

### Video Formats
- **MP4**: Universal compatibility, best for social media and web sharing
- **WebM**: Open format, excellent for web embedding and modern browsers

### Image Formats
- **GIF**: Animated format with universal support, ideal for quick sharing
- **PNG**: Single frame export with perfect quality

## Platform Presets

### Instagram Story
- Resolution: 1080×1920 (9:16 aspect ratio)
- Duration: 15 seconds max
- Frame Rate: 30 FPS
- Quality: High

### Instagram Post
- Resolution: 1080×1080 (1:1 aspect ratio)
- Duration: 60 seconds max
- Frame Rate: 30 FPS
- Quality: High

### YouTube
- Resolution: 1920×1080 (16:9 aspect ratio)
- Duration: Up to 5 minutes
- Frame Rate: 60 FPS
- Quality: Ultra

### TikTok
- Resolution: 1080×1920 (9:16 aspect ratio)
- Duration: 60 seconds max
- Frame Rate: 30 FPS
- Quality: High

### Twitter
- Resolution: 1280×720 (16:9 aspect ratio)
- Duration: 2:20 max
- Frame Rate: 30 FPS
- Quality: Medium

## Quality Settings

- **Low**: 1000 kbps bitrate, 24 FPS
- **Medium**: 2500 kbps bitrate, 30 FPS
- **High**: 5000 kbps bitrate, 30 FPS
- **Ultra**: 8000 kbps bitrate, 60 FPS

## Technical Implementation

### Export Manager (`Export3DManager`)
Main class that handles the export process:
- Creates off-screen rendering contexts
- Manages MediaRecorder for video capture
- Handles frame-by-frame GIF generation
- Provides progress tracking and cancellation

### Scene Manager Integration
Enhanced `SceneManager` with export features:
- `renderAtTime(time)`: Render animation at specific timestamp
- `setCanvasSize(width, height)`: Adjust canvas for export resolution
- `exportFrame()`: Capture single frame as PNG

### Export Panel UI
Comprehensive export interface:
- Format selection with platform-specific presets
- Quality and resolution controls
- Real-time progress tracking
- Platform optimization tips
- File size estimation

## Usage

### Basic Export
```typescript
const exportManager = new Export3DManager(sceneManager);

const settings: ExportSettings3D = {
  format: 'mp4',
  quality: 'high',
  resolution: '1080p',
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 5,
  platformPreset: 'youtube'
};

const result = await exportManager.export(
  templateId,
  customization,
  settings,
  onProgress,
  onComplete
);
```

### Platform-Optimized Export
```typescript
// Instagram Story preset
const instagramSettings = {
  ...baseSettings,
  platformPreset: 'instagram-story'
};

// Applies: 1080×1920, 30fps, 15s max, high quality
```

## Export Process Stages

1. **Preparing**: Setting up off-screen canvas and scene
2. **Recording**: Capturing animation frames
3. **Encoding**: Processing and compressing frames
4. **Finalizing**: Creating final file
5. **Complete**: Export finished successfully

## Performance Considerations

- Off-screen rendering prevents UI blocking
- Web Workers for GIF encoding (via gif.js)
- MediaRecorder API for efficient video capture
- Progress tracking with time estimates
- Memory management with automatic cleanup

## Browser Compatibility

- **MP4**: Supported in all modern browsers
- **WebM**: Chrome, Firefox, Edge (not Safari)
- **GIF**: Universal support
- **PNG**: Universal support

## File Size Optimization

- Quality presets optimize bitrate vs file size
- Platform presets enforce duration limits
- GIF compression with worker threads
- Automatic file size estimation

## Future Enhancements

- Audio track support for video exports
- Batch export for multiple formats
- Cloud processing for large files
- Advanced compression options
- Custom watermarking
- Export templates/presets sharing

## Error Handling

The system includes comprehensive error handling:
- Format compatibility checks
- Duration and size limits
- Memory usage monitoring
- Graceful degradation for unsupported features
- User-friendly error messages

## API Reference

### ExportSettings3D Interface
```typescript
interface ExportSettings3D {
  format: 'mp4' | 'webm' | 'gif' | 'png';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '720p' | '1080p' | '4k' | 'custom';
  width: number;
  height: number;
  fps: number;
  duration: number;
  bitrate?: number;
  transparent?: boolean;
  loop?: boolean;
  platformPreset?: string;
}
```

### Export Progress Tracking
```typescript
interface ExportProgress3D {
  stage: 'preparing' | 'recording' | 'encoding' | 'finalizing' | 'complete' | 'error';
  progress: number; // 0-1
  currentFrame: number;
  totalFrames: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  message: string;
}
```