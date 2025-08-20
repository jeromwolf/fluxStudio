# 🎮 Game System Architecture

The game system provides a flexible framework for creating mini-games within the
metaverse platform.

## 📁 Folder Structure

```
src/features/games/
├── core/                    # Core game system
│   ├── GameManager.ts      # Abstract base class for all games
│   ├── CollisionSystem.ts  # Collision detection system
│   └── index.ts
├── types/                   # TypeScript type definitions
│   └── index.ts
├── ui/                      # Reusable UI components
│   ├── GameOverlay.tsx     # Main game UI wrapper
│   ├── ScoreDisplay.tsx    # Score leaderboard
│   ├── Timer.tsx           # Countdown timer
│   ├── GameResults.tsx     # End game results
│   └── index.ts
├── utils/                   # Utility functions
│   ├── math.ts             # Math helpers
│   ├── effects.ts          # Visual effects
│   └── index.ts
├── coin-collector/          # Example game implementation
│   ├── CoinCollectorGame.ts
│   ├── CoinCollectorUI.tsx
│   ├── objects/
│   │   └── Coin.ts
│   └── index.ts
├── GameLauncher.tsx        # Game selection UI
└── index.ts                # Main exports and registry
```

## 🚀 Creating a New Game

### 1. Create Game Folder

```bash
mkdir src/features/games/my-game
```

### 2. Extend GameManager

```typescript
import { GameManager } from '../core/GameManager';
import { GameConfig, GameCategory } from '../types';

export class MyGame extends GameManager {
  static readonly CONFIG: GameConfig = {
    id: 'my-game',
    name: 'My Game',
    description: 'Description of your game',
    icon: '🎯',
    minPlayers: 1,
    maxPlayers: 4,
    duration: 120, // seconds
    category: GameCategory.ACTION,
  };

  constructor(scene: THREE.Scene) {
    super(MyGame.CONFIG);
    // Initialize your game
  }

  async initialize(): Promise<void> {
    // Setup game objects, collision handlers, etc.
  }

  update(deltaTime: number): void {
    // Game loop - called every frame
  }

  cleanup(): void {
    // Clean up resources when game ends
  }

  handlePlayerAction(playerId: string, action: any): void {
    // Handle player-specific actions
  }
}
```

### 3. Create Game UI

```typescript
import React from 'react'
import { GameOverlay } from '../ui/GameOverlay'
import { MyGame } from './MyGame'

export function MyGameUI({ game, currentPlayer, onExit }) {
  // Add your game-specific UI using the provided components
  return (
    <GameOverlay
      gameState={gameState}
      gameName="My Game"
      onStart={handleStart}
      onExit={onExit}
    >
      {/* Your game UI here */}
    </GameOverlay>
  )
}
```

### 4. Register Your Game

Add to `src/features/games/index.ts`:

```typescript
import { MyGame } from './my-game';

export const GAME_REGISTRY = {
  // ... existing games
  'my-game': {
    config: MyGame.CONFIG,
    gameClass: MyGame,
  },
};
```

## 🎯 Core Concepts

### GameManager

- Abstract base class for all games
- Handles game lifecycle (start, pause, resume, end)
- Manages players and scores
- Provides event system for UI updates

### CollisionSystem

- Efficient collision detection between game objects
- Type-based collision handlers
- Automatic cleanup

### Game States

- `IDLE`: Game not started
- `STARTING`: Game initializing
- `PLAYING`: Game active
- `PAUSED`: Game paused
- `ENDED`: Game finished

## 🎮 Example: Coin Collector

The coin collector game demonstrates:

- Spawning collectible objects
- Collision detection with player
- Score tracking
- Timer-based gameplay
- Visual effects on collection
- Complete UI integration

## 🔧 Utilities

### Math Utils

- `randomInRange()`: Random number generation
- `randomPosition()`: Random 3D positions
- `distance2D()`: 2D distance calculation
- `lerp()`: Linear interpolation
- `clamp()`: Value clamping

### Effects Utils

- `ParticleSystem`: Particle burst effects
- `createFloatingText()`: Floating score text

## 📝 Best Practices

1. **Keep games modular**: Each game in its own folder
2. **Reuse UI components**: Use provided UI components
3. **Clean up resources**: Always dispose of Three.js objects
4. **Handle edge cases**: Player disconnection, pause/resume
5. **Test multiplayer**: Ensure games work with multiple players

## 🎨 UI Components

### GameOverlay

Main wrapper providing:

- Game title
- Control buttons (Start, Pause, Resume, Exit)
- State overlays (Starting, Paused)

### ScoreDisplay

Real-time leaderboard showing:

- Player rankings
- Current scores
- Highlighted current player

### Timer

Countdown timer with:

- Color coding (green → yellow → red)
- Time up callback
- Formatted display

### GameResults

End game screen showing:

- Winner announcement
- Final scores
- Game duration
- Play again / Exit options

## 🚀 Future Extensions

Planned features:

- Power-ups system
- Achievement tracking
- Game replay system
- Spectator mode
- Tournament brackets
- Custom game modes
