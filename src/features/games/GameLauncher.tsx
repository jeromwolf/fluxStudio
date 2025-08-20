// Game Launcher Component - Example integration
import React, { useState } from 'react';
import * as THREE from 'three';

import { CoinCollectorGame, CoinCollectorUI } from './coin-collector';
import { GamePlayer } from './types';

import { GAME_REGISTRY, GameConfig } from './index';

interface GameLauncherProps {
  scene: THREE.Scene;
  currentPlayer: {
    id: string;
    name: string;
    avatar?: THREE.Object3D;
  };
  onClose?: () => void;
}

// Create a simple avatar mesh if none provided
function createDefaultAvatar(): THREE.Object3D {
  const group = new THREE.Group();

  // Body (using cylinder as CapsuleGeometry might not be available)
  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.8;
  group.add(body);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.8;
  group.add(head);

  group.name = 'defaultAvatar';
  return group;
}

export function GameLauncher({ scene, currentPlayer, onClose }: GameLauncherProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<CoinCollectorGame | null>(null);

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);

    // Create game instance based on selection
    if (gameId === 'coin-collector') {
      const game = new CoinCollectorGame(scene);

      // Add player avatar to collision system (create default if none)
      const avatar = currentPlayer.avatar || createDefaultAvatar();
      scene.add(avatar); // Add avatar to scene
      game.addPlayerAvatar(currentPlayer.id, avatar);

      setActiveGame(game);
    }
  };

  const handleCloseGame = () => {
    if (activeGame) {
      activeGame.end();
      setActiveGame(null);
    }
    setSelectedGame(null);
    // Remove avatar from scene if it's a default one
    if (!currentPlayer.avatar) {
      const avatar = scene.getObjectByName('defaultAvatar');
      if (avatar) scene.remove(avatar);
    }
    onClose?.();
  };

  const gamePlayer: GamePlayer = {
    id: currentPlayer.id,
    name: currentPlayer.name,
    avatar: currentPlayer.avatar,
    score: 0,
    isReady: true,
  };

  // Show game UI if a game is active
  if (activeGame && selectedGame === 'coin-collector') {
    return (
      <CoinCollectorUI game={activeGame} currentPlayer={gamePlayer} onExit={handleCloseGame} />
    );
  }

  // Show game selection menu
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">🎮 게임 선택</h2>

        <div className="space-y-4">
          <button
            onClick={() => handleSelectGame('coin-collector')}
            className="flex w-full transform items-center gap-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4 font-semibold text-white transition-all hover:scale-105 hover:from-yellow-500 hover:to-orange-600"
          >
            <span className="text-2xl">🪙</span>
            <div className="text-left">
              <div className="text-lg font-bold">코인 수집 게임</div>
              <div className="text-sm opacity-90">60초 내에 코인을 모으세요!</div>
            </div>
          </button>

          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <div className="mb-2 text-sm text-gray-500">🎯 게임 목표</div>
            <div className="text-xs text-gray-700">
              • 제한시간 내에 최대한 많은 코인 수집
              <br />
              • WASD 키로 아바타 조작
              <br />• 황금 코인은 더 높은 점수!
            </div>
          </div>

          <div className="border-t pt-3 text-center text-xs text-gray-400">
            더 많은 게임이 곧 추가됩니다! 🚀
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

interface GameCardProps {
  config: GameConfig;
  onSelect: () => void;
}

function GameCard({ config, onSelect }: GameCardProps) {
  return (
    <button
      onClick={onSelect}
      className="rounded-lg bg-gray-800 p-6 text-left transition-all hover:scale-105 hover:bg-gray-700"
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl">{config.icon}</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{config.name}</h3>
          <p className="mt-1 text-sm text-gray-400">{config.description}</p>
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>
              👥 {config.minPlayers}-{config.maxPlayers} players
            </span>
            {config.duration && <span>⏱️ {config.duration}s</span>}
          </div>
        </div>
      </div>
    </button>
  );
}
