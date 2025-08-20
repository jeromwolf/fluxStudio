// Coin Collector Game UI
import React, { useEffect, useState } from 'react';

import { GameState, GamePlayer, GameResults as GameResultsType } from '../types';
import { GameOverlay } from '../ui/GameOverlay';
import { GameResults } from '../ui/GameResults';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { Timer } from '../ui/Timer';

import { CoinCollectorGame } from './CoinCollectorGame';

interface CoinCollectorUIProps {
  game: CoinCollectorGame;
  currentPlayer: GamePlayer;
  onExit: () => void;
}

export function CoinCollectorUI({ game, currentPlayer, onExit }: CoinCollectorUIProps) {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameStats, setGameStats] = useState({
    collected: 0,
    total: 0,
    remaining: 0,
    timeRemaining: 0,
  });
  const [results, setResults] = useState<GameResultsType | null>(null);

  useEffect(() => {
    // Subscribe to game events
    const handleGameStart = () => setGameState(GameState.PLAYING);
    const handleGamePause = () => setGameState(GameState.PAUSED);
    const handleGameResume = () => setGameState(GameState.PLAYING);
    const handleGameEnd = (gameResults: GameResultsType) => {
      setGameState(GameState.ENDED);
      setResults(gameResults);
    };
    const handleScoreUpdate = () => {
      setPlayers([...game.getPlayers()]);
    };
    const handleCoinCollected = () => {
      setGameStats(game.getGameStats());
    };

    game.on('gameStart', handleGameStart);
    game.on('gamePause', handleGamePause);
    game.on('gameResume', handleGameResume);
    game.on('gameEnd', handleGameEnd);
    game.on('scoreUpdate', handleScoreUpdate);
    game.on('coinCollected', handleCoinCollected);

    // Update game stats periodically
    const statsInterval = setInterval(() => {
      if (game.getState() === GameState.PLAYING) {
        setGameStats(game.getGameStats());
      }
    }, 100);

    return () => {
      game.off('gameStart', handleGameStart);
      game.off('gamePause', handleGamePause);
      game.off('gameResume', handleGameResume);
      game.off('gameEnd', handleGameEnd);
      game.off('scoreUpdate', handleScoreUpdate);
      game.off('coinCollected', handleCoinCollected);
      clearInterval(statsInterval);
    };
  }, [game]);

  const handleStart = async () => {
    game.addPlayer(currentPlayer);
    setPlayers([currentPlayer]);
    await game.start();
    setGameStats(game.getGameStats());
  };

  const handlePlayAgain = () => {
    setResults(null);
    setGameState(GameState.IDLE);
    setGameStats({
      collected: 0,
      total: 0,
      remaining: 0,
      timeRemaining: 0,
    });
  };

  return (
    <>
      <GameOverlay
        gameState={gameState}
        gameName="Coin Collector"
        onStart={handleStart}
        onPause={() => game.pause()}
        onResume={() => game.resume()}
        onExit={onExit}
      >
        {/* Game-specific UI */}
        {gameState === GameState.PLAYING && (
          <>
            {/* Timer */}
            <div className="pointer-events-auto absolute top-20 left-4">
              <Timer
                duration={CoinCollectorGame.CONFIG.duration || 60}
                startTime={game.getInstance().startTime}
              />
            </div>

            {/* Coin Counter */}
            <div className="pointer-events-auto absolute top-40 left-4 rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🪙</span>
                <div>
                  <p className="text-sm text-white/70">Coins Collected</p>
                  <p className="text-2xl font-bold text-white">
                    {gameStats.collected} / {gameStats.total}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Display */}
            <ScoreDisplay players={players} currentPlayerId={currentPlayer.id} />

            {/* Instructions */}
            <div className="pointer-events-auto absolute bottom-4 left-4 rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm">
              <p className="text-sm text-white/70">Move around to collect coins!</p>
            </div>
          </>
        )}
      </GameOverlay>

      {/* Game Results */}
      {results && <GameResults results={results} onPlayAgain={handlePlayAgain} onExit={onExit} />}
    </>
  );
}
