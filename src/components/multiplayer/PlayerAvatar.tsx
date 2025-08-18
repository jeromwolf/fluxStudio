'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { PlayerState } from '@/lib/multiplayer/types'

interface PlayerAvatarProps {
  player: PlayerState
  isLocal?: boolean
}

export function PlayerAvatar({ player, isLocal = false }: PlayerAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetPosition = useRef(new THREE.Vector3(player.position.x, player.position.y, player.position.z))
  const currentPosition = useRef(new THREE.Vector3(player.position.x, player.position.y, player.position.z))
  
  // Load avatar config from localStorage if local player
  const avatarConfig = useMemo(() => {
    if (isLocal && typeof window !== 'undefined') {
      const saved = localStorage.getItem('avatarConfig')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return null
  }, [isLocal])
  
  // Avatar color based on config or player ID
  const avatarColor = useMemo(() => {
    if (avatarConfig?.bodyColor) return avatarConfig.bodyColor
    if (isLocal) return '#4ade80'
    const hash = player.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue = hash % 360
    return `hsl(${hue}, 70%, 50%)`
  }, [player.id, avatarConfig, isLocal])

  // Smooth position interpolation
  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Update target position
    targetPosition.current.set(player.position.x, player.position.y, player.position.z)
    
    // Lerp to target position for smooth movement
    currentPosition.current.lerp(targetPosition.current, 0.1)
    meshRef.current.position.copy(currentPosition.current)

    // Update rotation
    meshRef.current.quaternion.set(
      player.rotation.x,
      player.rotation.y,
      player.rotation.z,
      player.rotation.w
    )
  })

  return (
    <group>
      {/* Avatar body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial 
          color={isLocal ? '#4ade80' : avatarColor} 
          emissive={isLocal ? '#22c55e' : avatarColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Username label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {player.username}
      </Text>

      {/* Local player indicator */}
      {isLocal && (
        <mesh position={[0, 3, 0]}>
          <coneGeometry args={[0.3, 0.5, 4]} />
          <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}