// Main games module exports
export * from './types';
export * from './core';
export * from './coin-collector';
export * from './ui';
export * from './utils';
export { GameLauncher } from './GameLauncher';

// Game registry for easy access
import { CoinCollectorGame } from './coin-collector';
import { GameConfig, GameCategory } from './types';

export const GAME_REGISTRY: Record<
  string,
  {
    config: GameConfig;
    gameClass: typeof CoinCollectorGame;
  }
> = {
  'coin-collector': {
    config: CoinCollectorGame.CONFIG,
    gameClass: CoinCollectorGame,
  },
};

// Helper to get available games by category
export function getGamesByCategory(category: GameCategory): GameConfig[] {
  return Object.values(GAME_REGISTRY)
    .filter((game) => game.config.category === category)
    .map((game) => game.config);
}

// Helper to get all available games
export function getAllGames(): GameConfig[] {
  return Object.values(GAME_REGISTRY).map((game) => game.config);
}
