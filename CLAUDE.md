# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flux Studio is a web-based animation studio for creating geometric network animations with extensive export capabilities. The project is currently in the planning phase with a comprehensive PRD (Product Requirements Document) written in Korean.

## Tech Stack

**Frontend Framework:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)

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

Since the project hasn't been initialized yet, here are the typical commands for a Next.js TypeScript project:

```bash
# Initialize the project
npx create-next-app@latest . --typescript --tailwind --app

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Production preview
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

## Architecture Overview

The application follows a plugin-based architecture for export formats:

1. **Plugin System**: Each export format (GIF, MP4, WebM, SVG, Lottie, etc.) is implemented as a separate plugin extending the `ExportPlugin` abstract class.

2. **Directory Structure**:
   - `/app` - Next.js App Router pages and API routes
   - `/components` - React components organized by feature (canvas, export, controls, ui)
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

## Important Context

- The PRD (`animation-studio-prd.md`) contains detailed specifications for all features, export formats, and platform optimizations
- The project targets content creators and social media managers as primary users
- Performance is critical: 60 FPS animations, < 3s initial load, background processing for exports
- Security: Client-side processing preferred for privacy, optional cloud processing for premium features

## Development Guidelines

1. Follow the plugin architecture when implementing new export formats
2. Ensure all animations maintain 60 FPS performance
3. Implement platform-specific optimizations for social media exports
4. Use Web Workers for heavy processing to keep UI responsive
5. Test export formats against platform requirements (file size, dimensions, duration limits)