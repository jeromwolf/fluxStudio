'use client'

import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface AvatarConfig {
  bodyColor: string
  headShape: 'sphere' | 'box' | 'capsule'
  bodyShape: 'normal' | 'tall' | 'wide'
  accessory: 'none' | 'hat' | 'glasses' | 'crown'
}

const PRESET_COLORS = [
  '#4ade80', '#22c55e', '#16a34a',  // Greens
  '#60a5fa', '#3b82f6', '#2563eb',  // Blues
  '#f87171', '#ef4444', '#dc2626',  // Reds
  '#fbbf24', '#f59e0b', '#d97706',  // Yellows
  '#a78bfa', '#8b5cf6', '#7c3aed',  // Purples
  '#f472b6', '#ec4899', '#db2777',  // Pinks
]

function Avatar({ config }: { config: AvatarConfig }) {
  const bodyScale = config.bodyShape === 'tall' ? [1, 1.3, 1] : 
                    config.bodyShape === 'wide' ? [1.3, 1, 1.3] : [1, 1, 1]
  
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0, 0]} scale={bodyScale} castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        {config.headShape === 'sphere' && <sphereGeometry args={[0.4, 16, 16]} />}
        {config.headShape === 'box' && <boxGeometry args={[0.6, 0.6, 0.6]} />}
        {config.headShape === 'capsule' && <capsuleGeometry args={[0.3, 0.3, 4, 8]} />}
        <meshStandardMaterial color={config.bodyColor} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.15, 1.6, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.15, 1.6, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Accessories */}
      {config.accessory === 'hat' && (
        <mesh position={[0, 2.1, 0]} castShadow>
          <coneGeometry args={[0.5, 0.5, 8]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      )}
      
      {config.accessory === 'glasses' && (
        <group position={[0, 1.6, 0.35]}>
          <mesh position={[-0.15, 0, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.02]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </group>
      )}
      
      {config.accessory === 'crown' && (
        <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.3, 8, 1, true]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      )}
    </group>
  )
}

interface AvatarCustomizerProps {
  initialConfig?: AvatarConfig
  onSave: (config: AvatarConfig) => void
  className?: string
}

export function AvatarCustomizer({ 
  initialConfig = {
    bodyColor: '#4ade80',
    headShape: 'sphere',
    bodyShape: 'normal',
    accessory: 'none'
  },
  onSave,
  className 
}: AvatarCustomizerProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig)

  const updateConfig = (key: keyof AvatarConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={cn("flex gap-4", className)}>
      {/* 3D Preview */}
      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
        <Canvas shadows camera={{ position: [3, 3, 3], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Avatar config={config} />
          <OrbitControls 
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            target={[0, 0.5, 0]}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
        </Canvas>
      </div>

      {/* Controls */}
      <div className="w-80 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Customize Avatar</h2>
        
        {/* Color Selection */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Body Color</Label>
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                className={cn(
                  "w-10 h-10 rounded-lg border-2 transition-all",
                  config.bodyColor === color ? "border-gray-900 scale-110" : "border-gray-300"
                )}
                style={{ backgroundColor: color }}
                onClick={() => updateConfig('bodyColor', color)}
              />
            ))}
          </div>
        </div>

        {/* Head Shape */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Head Shape</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['sphere', 'box', 'capsule'] as const).map(shape => (
              <Button
                key={shape}
                variant={config.headShape === shape ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateConfig('headShape', shape)}
                className="capitalize"
              >
                {shape}
              </Button>
            ))}
          </div>
        </div>

        {/* Body Shape */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Body Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'tall', 'wide'] as const).map(shape => (
              <Button
                key={shape}
                variant={config.bodyShape === shape ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateConfig('bodyShape', shape)}
                className="capitalize"
              >
                {shape}
              </Button>
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div className="mb-8">
          <Label className="text-sm font-medium mb-3 block">Accessory</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'hat', 'glasses', 'crown'] as const).map(accessory => (
              <Button
                key={accessory}
                variant={config.accessory === accessory ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateConfig('accessory', accessory)}
                className="capitalize"
              >
                {accessory === 'none' ? 'None' : 
                 accessory === 'hat' ? '🎩 Hat' :
                 accessory === 'glasses' ? '👓 Glasses' :
                 '👑 Crown'}
              </Button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={() => onSave(config)} 
          className="w-full"
          size="lg"
        >
          Save Avatar
        </Button>
      </div>
    </div>
  )
}