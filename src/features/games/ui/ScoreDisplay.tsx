// Score Display Component
import React from 'react';

import { GamePlayer } from '../types';

interface ScoreDisplayProps {
  players: GamePlayer[];
  currentPlayerId?: string;
}

export function ScoreDisplay({ players, currentPlayerId }: ScoreDisplayProps) {
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="pointer-events-auto absolute top-20 right-4 min-w-[200px] rounded-lg bg-black/50 p-4 backdrop-blur-sm">
      <h3 className="mb-2 text-lg font-bold text-white">Scores</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between ${
              player.id === currentPlayerId ? 'text-yellow-400' : 'text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-50">#{index + 1}</span>
              <span className="font-medium">{player.name}</span>
            </div>
            <span className="font-bold">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
