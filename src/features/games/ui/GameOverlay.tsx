// Game UI Overlay Component
import React from 'react';

import { GameState } from '../types';

interface GameOverlayProps {
  gameState: GameState;
  gameName: string;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onExit?: () => void;
  children?: React.ReactNode;
}

export function GameOverlay({
  gameState,
  gameName,
  onStart,
  onPause,
  onResume,
  onExit,
  children,
}: GameOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Game Header */}
      <div className="pointer-events-auto absolute top-4 right-4 left-4 flex items-start justify-between">
        <div className="rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white">{gameName}</h2>
        </div>

        {/* Game Controls */}
        <div className="flex gap-2">
          {gameState === GameState.IDLE && onStart && (
            <button
              onClick={onStart}
              className="rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
            >
              Start Game
            </button>
          )}

          {gameState === GameState.PLAYING && onPause && (
            <button
              onClick={onPause}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-white transition-colors hover:bg-yellow-600"
            >
              Pause
            </button>
          )}

          {gameState === GameState.PAUSED && onResume && (
            <button
              onClick={onResume}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Resume
            </button>
          )}

          {onExit && (
            <button
              onClick={onExit}
              className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Game-specific UI elements */}
      {children}

      {/* Game State Overlay */}
      {gameState === GameState.STARTING && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-black/80 p-8 backdrop-blur-sm">
            <h3 className="animate-pulse text-3xl font-bold text-white">Get Ready!</h3>
          </div>
        </div>
      )}

      {gameState === GameState.PAUSED && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-black/80 p-8 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white">Game Paused</h3>
            <p className="mt-2 text-white/70">Press Resume to continue</p>
          </div>
        </div>
      )}
    </div>
  );
}
