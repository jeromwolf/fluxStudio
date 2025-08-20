'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useMemo, Suspense } from 'react';
import * as THREE from 'three';

import { AvatarCustomization } from '@/features/avatar/types';

// Detailed avatar mesh component
function AvatarMesh({ avatar }: { avatar: AvatarCustomization }) {
  const skinColor = avatar.body?.skinColor || '#FDBCB4';
  const hairColor = avatar.hair?.color || '#000000';
  const hairHighlights = avatar.hair?.highlights;
  const eyeColor = avatar.face?.eyes?.color || '#000000';
  const height = avatar.body?.height || 1.0;

  // Body scale based on type
  const getBodyScale = (type: string) => {
    switch (type) {
      case 'slim':
        return [0.9, 1, 0.9];
      case 'athletic':
        return [1.1, 1.1, 1.1];
      case 'average':
        return [1, 1, 1];
      case 'curvy':
        return [1.2, 1, 1.2];
      case 'muscular':
        return [1.3, 1.1, 1.2];
      default:
        return [1, 1, 1];
    }
  };
  const bodyScale = getBodyScale(avatar.body?.type || 'average');

  return (
    <group scale={[1, height, 1]}>
      {/* Body */}
      <group scale={bodyScale}>
        {/* Torso */}
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, -0.2]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, 0.2]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.15, -0.7, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.15, -0.7, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* Head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Face features */}
      <group position={[0, 0.8, 0.2]}>
        {/* Eyes */}
        <mesh position={[-0.08, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.08, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {/* Eye pupils */}
        <mesh position={[-0.08, 0, 0.02]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={eyeColor} />
        </mesh>
        <mesh position={[0.08, 0, 0.02]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={eyeColor} />
        </mesh>
      </group>

      {/* Hair */}
      {avatar.hair?.style !== 'bald' && (
        <group position={[0, 1, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
          {/* Hair highlights */}
          {hairHighlights && (
            <mesh>
              <sphereGeometry args={[0.29, 16, 16]} />
              <meshStandardMaterial color={hairHighlights} transparent opacity={0.3} />
            </mesh>
          )}
        </group>
      )}

      {/* Clothing */}
      {avatar.clothing?.top && (
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.32, 0.6, 16]} />
          <meshStandardMaterial color={avatar.clothing.top.color || '#3B82F6'} />
        </mesh>
      )}

      {avatar.clothing?.bottom && (
        <group position={[0, -0.6, 0]}>
          {/* Pants/Skirt */}
          {avatar.clothing.bottom.type === 'pants' ? (
            <>
              <mesh position={[-0.15, 0, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.1, 0.5, 8]} />
                <meshStandardMaterial color={avatar.clothing.bottom.color || '#2563EB'} />
              </mesh>
              <mesh position={[0.15, 0, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.1, 0.5, 8]} />
                <meshStandardMaterial color={avatar.clothing.bottom.color || '#2563EB'} />
              </mesh>
            </>
          ) : (
            <mesh castShadow>
              <cylinderGeometry args={[0.35, 0.3, 0.4, 16]} />
              <meshStandardMaterial color={avatar.clothing.bottom.color || '#FFB6C1'} />
            </mesh>
          )}
        </group>
      )}

      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

interface AvatarControllerProps {
  avatar: AvatarCustomization;
  position?: THREE.Vector3;
  onPositionChange?: (position: THREE.Vector3) => void;
}

// Movement configuration
const MOVE_SPEED = 5.0; // units per second
const RUN_SPEED = 10.0; // units per second when running
const ROTATION_SPEED = 2.0; // radians per second
const CAMERA_DISTANCE = 8.0;
const CAMERA_HEIGHT = 4.0;
const CAMERA_LERP_FACTOR = 0.1;

export function AvatarController({ avatar, position, onPositionChange }: AvatarControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();

  // Movement state
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    running: false,
    velocity: new THREE.Vector3(),
    rotation: 0,
  });

  // Initialize position
  useEffect(() => {
    if (groupRef.current && position) {
      groupRef.current.position.copy(position);
    }
  }, [position]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          moveState.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          moveState.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          moveState.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          moveState.current.right = true;
          break;
        case 'shift':
          moveState.current.running = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          moveState.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          moveState.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          moveState.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          moveState.current.right = false;
          break;
        case 'shift':
          moveState.current.running = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update movement and camera
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const { forward, backward, left, right, running } = moveState.current;
    const speed = running ? RUN_SPEED : MOVE_SPEED;

    // Rotation
    if (left) {
      moveState.current.rotation += ROTATION_SPEED * delta;
    }
    if (right) {
      moveState.current.rotation -= ROTATION_SPEED * delta;
    }

    groupRef.current.rotation.y = moveState.current.rotation;

    // Movement
    const moveVector = new THREE.Vector3();
    if (forward) {
      moveVector.z = -speed * delta;
    }
    if (backward) {
      moveVector.z = speed * delta;
    }

    // Apply rotation to movement vector
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), moveState.current.rotation);

    // Update position
    groupRef.current.position.add(moveVector);

    // Callback for position changes
    if ((forward || backward || left || right) && onPositionChange) {
      onPositionChange(groupRef.current.position.clone());
    }

    // Update camera to follow avatar (third-person view)
    const avatarPosition = groupRef.current.position;
    const cameraOffset = new THREE.Vector3(
      Math.sin(moveState.current.rotation) * CAMERA_DISTANCE,
      CAMERA_HEIGHT,
      Math.cos(moveState.current.rotation) * CAMERA_DISTANCE
    );

    const desiredCameraPosition = avatarPosition.clone().add(cameraOffset);
    camera.position.lerp(desiredCameraPosition, CAMERA_LERP_FACTOR);
    camera.lookAt(avatarPosition);
  });

  // Create detailed avatar mesh based on customization data
  const avatarMesh = useMemo(() => {
    return <AvatarMesh avatar={avatar} />;
  }, [avatar]);

  return (
    <group ref={groupRef} castShadow>
      {avatarMesh}
    </group>
  );
}
