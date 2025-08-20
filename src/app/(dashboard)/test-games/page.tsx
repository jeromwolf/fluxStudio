'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

import { Button } from '@/components/ui/button';
import { GameLauncher } from '@/features/games';

function GameScene({ onSceneReady }: { onSceneReady: (scene: THREE.Scene) => void }) {
  const { scene } = useThree();

  useEffect(() => {
    onSceneReady(scene);
  }, [scene, onSceneReady]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <gridHelper args={[50, 50]} />
      <OrbitControls />
    </>
  );
}

import { useThree } from '@react-three/fiber';

export default function TestGamesPage() {
  const [showGames, setShowGames] = useState(false);
  const [gameScene, setGameScene] = useState<THREE.Scene | null>(null);

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-white p-4">
        <h1 className="mb-2 text-2xl font-bold">게임 테스트</h1>
        <Button onClick={() => setShowGames(true)} disabled={!gameScene}>
          게임 시작하기
        </Button>
      </div>

      <div className="flex-1">
        <Canvas>
          <GameScene onSceneReady={setGameScene} />
        </Canvas>
      </div>

      {showGames && gameScene && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
            <GameLauncher
              scene={gameScene}
              currentPlayer={{
                id: 'test-player',
                name: '테스트 플레이어',
              }}
              onClose={() => setShowGames(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
