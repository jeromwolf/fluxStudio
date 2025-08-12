# Flux Studio

A web-based animation studio for creating geometric network animations with
synchronized audio effects.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd flux-studio

# Install dependencies
npm install
```

### Development

Use the provided script to start the development server (handles port conflicts
automatically):

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

### Port Management

Check and manage port 3456:

```bash
./port-check.sh
```

## 🛠️ Scripts

- `./dev.sh` - Start development server with auto port management
- `./start.sh` - Build and start production server
- `./port-check.sh` - Check and manage port 3456
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

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

## 🎨 Features

- **Real-time Animation Canvas** - 60fps WebGL-accelerated rendering
- **Audio Synthesis** - Create and sync sound effects with animations
- **Multi-format Export** - GIF, MP4, WebM, SVG, Lottie, and more
- **Timeline Editor** - Precise control over animation and audio timing
- **Plugin Architecture** - Extensible export format system

## 📖 Documentation

- [Product Requirements Document](./animation-studio-prd.md)
- [Task Breakdown](./TASK_BREAKDOWN.md)
- [Claude AI Assistant Guide](./CLAUDE.md)

## 🤝 Contributing

This project is in active development. See TASK_BREAKDOWN.md for current
development status and roadmap.

## 📄 License

[Your License Here]
