'use client'

import React, { useRef, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Sky, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useMultiplayerContext } from './MultiplayerProvider'
import { PlayerAvatar } from './PlayerAvatar'

function PlayerController() {
  const { camera } = useThree()
  const { updatePosition, updateRotation, getLocalPlayer } = useMultiplayerContext()
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': keys.current.forward = true; break
        case 's': keys.current.backward = true; break
        case 'a': keys.current.left = true; break
        case 'd': keys.current.right = true; break
        case 'shift': keys.current.shift = true; break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': keys.current.forward = false; break
        case 's': keys.current.backward = false; break
        case 'a': keys.current.left = false; break
        case 'd': keys.current.right = false; break
        case 'shift': keys.current.shift = false; break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    const localPlayer = getLocalPlayer()
    if (!localPlayer) return

    const speed = keys.current.shift ? 10 : 5
    direction.current.set(0, 0, 0)

    if (keys.current.forward) direction.current.z -= 1
    if (keys.current.backward) direction.current.z += 1
    if (keys.current.left) direction.current.x -= 1
    if (keys.current.right) direction.current.x += 1

    direction.current.normalize()
    
    // Apply camera rotation to movement direction
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0
    cameraDirection.normalize()

    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(camera.up, cameraDirection)
    cameraRight.normalize()

    const moveDirection = new THREE.Vector3()
    moveDirection.addScaledVector(cameraDirection, -direction.current.z)
    moveDirection.addScaledVector(cameraRight, direction.current.x)

    velocity.current.add(moveDirection.multiplyScalar(speed * delta))
    velocity.current.multiplyScalar(0.9) // Friction

    const newPosition = {
      x: localPlayer.position.x + velocity.current.x,
      y: localPlayer.position.y,
      z: localPlayer.position.z + velocity.current.z
    }

    updatePosition(newPosition)

    // Update camera to follow player
    camera.position.x = newPosition.x
    camera.position.y = newPosition.y + 5
    camera.position.z = newPosition.z + 10
    camera.lookAt(newPosition.x, newPosition.y, newPosition.z)
  })

  return null
}

function MultiplayerWorld() {
  const { players, getLocalPlayer } = useMultiplayerContext()
  const localPlayer = getLocalPlayer()

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      
      {/* Environment */}
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="city" />
      
      {/* Ground */}
      <Grid 
        args={[100, 100]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6b7280" 
        sectionSize={10} 
        sectionThickness={1} 
        sectionColor="#374151" 
        fadeDistance={100} 
        fadeStrength={1} 
        infiniteGrid
      />
      
      {/* Ground plane for shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {/* Render all players */}
      {players.map(player => (
        <PlayerAvatar 
          key={player.id} 
          player={player} 
          isLocal={player.id === localPlayer?.id}
        />
      ))}

      {/* Local player */}
      {localPlayer && (
        <PlayerAvatar 
          player={localPlayer} 
          isLocal={true}
        />
      )}

      {/* Player controller */}
      <PlayerController />
    </>
  )
}

interface MultiplayerSceneProps {
  className?: string
}

export function MultiplayerScene({ className }: MultiplayerSceneProps) {
  const { isConnected, error } = useMultiplayerContext()

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Connection Error</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to world...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <MultiplayerWorld />
        <OrbitControls 
          enablePan={false}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
      
      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Controls</h4>
        <p className="text-sm">W/A/S/D - Move</p>
        <p className="text-sm">Shift - Run</p>
        <p className="text-sm">Mouse - Look around</p>
      </div>
    </div>
  )
}