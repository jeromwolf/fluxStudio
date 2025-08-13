# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

Flux Studio is a web-based animation studio for creating geometric network
animations with extensive export capabilities. The project has a comprehensive
PRD (Product Requirements Document) written in Korean and is currently in active
development with core animation features implemented.

## Tech Stack

**Frontend Framework:**

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- next-intl (internationalization - Korean/English)
- next-themes (dark/light theme support)

**Animation Engine:**

- HTML5 Canvas API
- WebGL (advanced rendering)
- Web Workers (heavy processing)
- OffscreenCanvas (when available)

**Export Engine:**

- gif.js (GIF generation)
- MediaRecorder API (MP4/WebM)
- FFmpeg.wasm (advanced processing)
- lottie-web (Lottie export)
- fabric.js (SVG processing)

**Audio Engine:**

- Web Audio API (real-time sound generation)
- Tone.js (music production and sequencing)
- Wavesurfer.js (audio visualization)
- RecordRTC (audio recording)
- Howler.js (audio playback management)

**Infrastructure:**

- Vercel (frontend deployment)
- Supabase (database, authentication)
- R2/S3 (file storage)
- Redis (caching)

## Common Commands

The project is fully set up with the following commands:

```bash
# Install dependencies
npm install

# Development (runs on port 3456)
npm run dev

# Build
npm run build

# Production preview
npm run start

# Linting
npm run lint

# Type checking (if available)
npm run type-check
```

## Architecture Overview

The application follows a plugin-based architecture for export formats:

1. **Plugin System**: Each export format (GIF, MP4, WebM, SVG, Lottie, etc.) is
   implemented as a separate plugin extending the `ExportPlugin` abstract class.

2. **Directory Structure**:
   - `/app` - Next.js App Router pages and API routes
   - `/components` - React components organized by feature (canvas, export,
     controls, ui)
   - `/lib` - Core libraries (export-system, animation-engine, types)
   - `/plugins` - Export format plugins

3. **Key Components**:
   - `AnimationCanvas` - Main canvas component for rendering animations
   - `ExportPlugin` - Abstract class for export format plugins
   - `ExportPluginRegistry` - Manages and coordinates export plugins

4. **Export Flow**:
   - User creates animation on canvas
   - Selects export format and settings
   - Appropriate plugin processes the canvas data
   - Output is optimized for the target platform (social media, web, etc.)

5. **Audio System**:
   - Real-time sound synthesis using Web Audio API
   - Multi-track audio timeline synchronized with animations
   - Built-in effect processors (reverb, delay, filters)
   - Support for audio exports (MP3, WAV, OGG, AAC)
   - Audio can be embedded in video exports or exported separately

## Current Implementation Status (2025-08-13)

### ✅ Completed Features

- **Core Infrastructure**: Next.js 14 setup with TypeScript and CSS fallback
- **State Management**: Zustand store with complete CRUD operations for
  projects, layers, shapes, and animations
- **Shape Rendering**: Circle and Network node rendering with properties and
  animations
- **Animation System**: Keyframe system with 30+ easing functions, timeline
  controls
- **Canvas Implementation**: Canvas2D rendering with real-time performance
  monitoring
- **Export Architecture**: Plugin-based system with PNG and GIF export
  capabilities
- **UI Framework**: Basic studio interface with timeline, export panel, and
  animation canvas

### 🔧 Technical Implementation

- **Canvas Context**: Currently Canvas2D (WebGL support planned)
- **Shape Types**:
  - Circle: Radius scaling animations, customizable colors/strokes
  - Network: Multi-node systems with animated connections and particles
- **Animation Features**: Automatic animations applied on shape creation
- **Positioning**: Random placement system to prevent shape overlap
- **Performance**: Live FPS and frame time monitoring in development

### ⚠️ Known Issues & Limitations

- **UI Design**: Basic styling needs professional design improvements
- **Audio System**: Not yet implemented (Web Audio API planned)
- **Export Testing**: PNG/GIF exports need thorough testing
- **WebGL Migration**: Canvas2D works but WebGL needed for better performance

### 🎯 Next Development Priorities

1. **UI/UX Enhancement**: Professional interface design and responsive layout
2. **Audio Integration**: Web Audio API implementation for sound synthesis
3. **Shape Library**: Additional geometric shapes and advanced network types
4. **Export Validation**: Testing and optimization of export functionality
5. **Performance**: WebGL rendering implementation for 60fps guarantee
6. **Timeline Features**: Advanced keyframe editing and animation controls

## Important Context

- The PRD (`animation-studio-prd.md`) contains detailed specifications for all
  features, export formats, and platform optimizations
- The project targets content creators and social media managers as primary
  users
- Performance is critical: 60 FPS animations, < 3s initial load, background
  processing for exports
- Security: Client-side processing preferred for privacy, optional cloud
  processing for premium features
- UI/UX: Supports Korean/English languages and light/dark themes
- Accessibility: Keyboard navigation, screen reader support, and customizable
  font sizes

## Development Guidelines

1. Follow the plugin architecture when implementing new export formats
2. Ensure all animations maintain 60 FPS performance
3. Implement platform-specific optimizations for social media exports
4. Use Web Workers for heavy processing to keep UI responsive
5. Test export formats against platform requirements (file size, dimensions,
   duration limits)
