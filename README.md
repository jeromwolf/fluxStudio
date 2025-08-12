# Flux Studio 🎨

<div align="center">
  <p>
    <strong>Create stunning geometric network animations with synchronized audio effects</strong>
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#roadmap">Roadmap</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

## Overview

Flux Studio is a web-based animation studio that empowers content creators to
design and export professional geometric network animations with real-time audio
synthesis. Built with modern web technologies, it offers an intuitive interface
for creating eye-catching animations perfect for social media, presentations,
and creative projects.

## ✨ Features

### 🎬 Animation Engine

- **Real-time Canvas**: 60fps Canvas2D rendering with WebGL planned
- **Geometric Shapes**: Circle animations with radius scaling
- **Network Nodes**: Multi-node networks with connections and particles
- **Keyframe System**: 30+ easing functions for smooth animations
- **Timeline Editor**: Play/pause controls with duration settings

### 🎵 Audio System

- **Real-time Synthesis**: Create sound effects on the fly
- **Multi-track Timeline**: Sync audio with animations
- **Effect Processors**: Built-in reverb, delay, filters
- **Beat Detection**: Auto-sync animations to music

### 📤 Export Capabilities

- **Multiple Formats**: GIF, MP4, WebM, SVG, Lottie, and more
- **Social Media Optimization**: Presets for Instagram, TikTok, YouTube
- **Batch Export**: Generate multiple formats simultaneously
- **Platform-specific**: Auto-optimization for each platform

### 🌐 Internationalization & Themes

- **Languages**: Korean (한국어) and English
- **Theme Modes**: Dark mode (default) and Light mode
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jeromwolf/fluxStudio.git
cd flux-studio

# Install dependencies
npm install
```

### Development

Use the provided script to start the development server:

```bash
./dev.sh
```

Or manually:

```bash
npm run dev
```

The application will run on [http://localhost:3456](http://localhost:3456).

### Production

Build and start the production server:

```bash
./start.sh
```

Or manually:

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

### Frontend

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Zustand** - State management

### Animation & Graphics

- **React Three Fiber** - React renderer for Three.js
- **HTML5 Canvas API** - 2D graphics
- **WebGL** - Hardware acceleration
- **Web Workers** - Background processing

### Audio

- **Tone.js** - Music production framework
- **Howler.js** - Audio playback
- **Web Audio API** - Low-level audio processing

### Internationalization & Theming

- **next-intl** - i18n support
- **next-themes** - Theme management

## 📁 Project Structure

```
flux-studio/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (dashboard)/     # Dashboard routes
│   │   │   └── studio/      # Main studio interface
│   │   └── api/             # API routes
│   ├── components/          # React components
│   │   ├── canvas/          # Animation canvas
│   │   ├── audio/           # Audio components
│   │   ├── export/          # Export functionality
│   │   └── ui/              # UI components
│   ├── lib/                 # Core libraries
│   │   ├── animation-engine/
│   │   ├── audio-engine/
│   │   └── export-system/
│   └── types/               # TypeScript types
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🗺️ Roadmap

### Phase 1: MVP (Current)

- [x] Project setup and infrastructure
- [x] Development environment configuration
- [x] Canvas animation engine (2D rendering)
- [x] Basic geometric animations (Circle, Network nodes)
- [x] State management with Zustand
- [x] Shape rendering system with animations
- [x] Timeline controls and keyframe system
- [x] Export plugin architecture (PNG, GIF)
- [ ] Audio synthesis integration
- [ ] UI/UX improvements and responsive design

### Phase 2: Extended Features

- [ ] Video export (MP4/WebM)
- [ ] Advanced animation types
- [ ] Social media presets
- [ ] Cloud storage integration

### Phase 3: Premium Features

- [ ] AI-powered animations
- [ ] Template marketplace
- [ ] Collaboration tools
- [ ] API access

## 🤝 Contributing

We welcome contributions! Please see our [Task Breakdown](./TASK_BREAKDOWN.md)
for current development status.

### Development Guidelines

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Submit PRs with clear descriptions

## 📖 Documentation

- [Product Requirements Document](./animation-studio-prd.md) (Korean)
- [Task Breakdown](./TASK_BREAKDOWN.md)
- [Claude AI Assistant Guide](./CLAUDE.md)

## 📄 License

This project is currently in development. License information will be added
soon.

---

<div align="center">
  <p>Built with ❤️ using Next.js and modern web technologies</p>
  <p>
    <a href="https://github.com/jeromwolf/fluxStudio">GitHub</a> •
    <a href="https://github.com/jeromwolf/fluxStudio/issues">Issues</a> •
    <a href="https://github.com/jeromwolf/fluxStudio/pulls">Pull Requests</a>
  </p>
</div>
