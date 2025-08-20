'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';

import { useSelectedAvatar } from '@/shared/stores/avatar-store';

import { AvatarController } from './AvatarController';

interface AvatarWorldIntegrationProps {
  enabled: boolean;
  onAvatarPositionChange?: (position: THREE.Vector3) => void;
}

export function AvatarWorldIntegration({
  enabled,
  onAvatarPositionChange,
}: AvatarWorldIntegrationProps) {
  const selectedAvatar = useSelectedAvatar();
  const [avatarPosition, setAvatarPosition] = useState(new THREE.Vector3(0, 0, 0));

  // Show controls hint
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (enabled && showControls) {
      const timer = setTimeout(() => setShowControls(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [enabled, showControls]);

  if (!enabled || !selectedAvatar) {
    return null;
  }

  const handlePositionChange = (position: THREE.Vector3) => {
    setAvatarPosition(position);
    onAvatarPositionChange?.(position);
  };

  return (
    <>
      <AvatarController
        avatar={selectedAvatar}
        position={avatarPosition}
        onPositionChange={handlePositionChange}
      />

      {/* Controls overlay */}
      {showControls && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform rounded-lg bg-black/80 px-6 py-4 text-white shadow-xl">
          <div className="text-center">
            <p className="mb-2 font-semibold">아바타 조작 방법</p>
            <div className="flex gap-6 text-sm">
              <div>
                <kbd className="rounded bg-white/20 px-2 py-1">W/A/S/D</kbd> 또는{' '}
                <kbd className="rounded bg-white/20 px-2 py-1">방향키</kbd> - 이동
              </div>
              <div>
                <kbd className="rounded bg-white/20 px-2 py-1">Shift</kbd> - 달리기
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
