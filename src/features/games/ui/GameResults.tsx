// Game Results Display Component
import React from 'react';

import { GameResults as GameResultsType } from '../types';

interface GameResultsProps {
  results: GameResultsType;
  onPlayAgain?: () => void;
  onExit?: () => void;
}

export function GameResults({ results, onPlayAgain, onExit }: GameResultsProps) {
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl bg-gray-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Game Over!</h2>

        {/* Winner */}
        {results.winner && (
          <div className="mb-6 rounded-lg bg-yellow-500/20 p-4 text-center">
            <p className="text-sm text-yellow-400">Winner</p>
            <p className="text-2xl font-bold text-white">{results.winner.name}</p>
            <p className="mt-1 text-xl text-yellow-400">{results.winner.score} points</p>
          </div>
        )}

        {/* All Scores */}
        <div className="mb-6 space-y-3">
          <h3 className="mb-2 font-semibold text-white">Final Scores</h3>
          {results.scores.map((entry, index) => (
            <div
              key={entry.player.id}
              className={`flex items-center justify-between rounded-lg p-3 ${
                index === 0 ? 'bg-yellow-500/10' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold ${index === 0 ? 'text-yellow-400' : 'text-white/50'}`}>
                  #{index + 1}
                </span>
                <span className="text-white">{entry.player.name}</span>
              </div>
              <span className="font-bold text-white">{entry.score}</span>
            </div>
          ))}
        </div>

        {/* Game Duration */}
        <div className="mb-6 text-center text-white/70">
          <p>Game Duration: {formatDuration(results.duration)}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="flex-1 rounded-lg bg-green-500 py-3 font-semibold text-white transition-colors hover:bg-green-600"
            >
              Play Again
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="flex-1 rounded-lg bg-gray-700 py-3 font-semibold text-white transition-colors hover:bg-gray-600"
            >
              Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
