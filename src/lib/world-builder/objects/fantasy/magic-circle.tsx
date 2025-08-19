import React from 'react'
import { Ring, Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'
import * as THREE from 'three'

export function MagicCircleObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const circleColor = object.state?.circleColor || '#9400D3'
  const glowColor = object.state?.glowColor || '#E6E6FA'
  const runeCount = object.state?.runeCount || 8
  
  return (
    <group>
      {/* Base platform */}
      <Cylinder args={[2, 2, 0.1]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#1C1C1C" roughness={0.8} />
      </Cylinder>
      
      {/* Outer ring */}
      <Ring args={[1.8, 2, 64]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
        <meshStandardMaterial 
          color={circleColor}
          emissive={circleColor}
          emissiveIntensity={0.5}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
        />
      </Ring>
      
      {/* Inner ring */}
      <Ring args={[1.2, 1.4, 64]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
        <meshStandardMaterial 
          color={circleColor}
          emissive={circleColor}
          emissiveIntensity={0.5}
        />
      </Ring>
      
      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial 
          color={circleColor}
          emissive={circleColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Runes around the circle */}
      {Array.from({ length: runeCount }).map((_, i) => {
        const angle = (i / runeCount) * Math.PI * 2
        const x = Math.cos(angle) * 1.6
        const z = Math.sin(angle) * 1.6
        
        return (
          <mesh key={`rune-${i}`} position={[x, 0.12, z]} rotation={[-Math.PI / 2, 0, angle]}>
            <planeGeometry args={[0.2, 0.3]} />
            <meshStandardMaterial 
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
      
      {/* Connecting lines */}
      {Array.from({ length: runeCount }).map((_, i) => {
        const angle1 = (i / runeCount) * Math.PI * 2
        const angle2 = ((i + 1) / runeCount) * Math.PI * 2
        const x1 = Math.cos(angle1) * 1.3
        const z1 = Math.sin(angle1) * 1.3
        const x2 = Math.cos(angle2) * 1.3
        const z2 = Math.sin(angle2) * 1.3
        
        const midX = (x1 + x2) / 2
        const midZ = (z1 + z2) / 2
        const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)
        const rotation = Math.atan2(z2 - z1, x2 - x1)
        
        return (
          <mesh 
            key={`line-${i}`} 
            position={[midX, 0.11, midZ]} 
            rotation={[-Math.PI / 2, 0, rotation]}
          >
            <planeGeometry args={[length, 0.05]} />
            <meshStandardMaterial 
              color={circleColor}
              emissive={circleColor}
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}
      
      {/* Magical glow particles */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const radius = 0.8 + Math.sin(Date.now() * 0.001 + i) * 0.2
        const x = Math.cos(rad) * radius
        const z = Math.sin(rad) * radius
        const y = 0.3 + Math.sin(Date.now() * 0.002 + i) * 0.1
        
        return (
          <mesh key={`particle-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={1}
              opacity={0.8}
              transparent
            />
          </mesh>
        )
      })}
      
      {isSelected && (
        <Cylinder args={[2.5, 2.5, 1, 32, 1, true]} position={[0, 0.5, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Cylinder>
      )}
    </group>
  )
}

export const magicCircleSchema = new PropertyBuilder()
  .addGroup({
    id: 'magic',
    label: '마법 속성',
    icon: '✨',
    properties: [
      {
        key: 'circleColor',
        type: PropertyType.COLOR,
        label: '마법진 색상',
        defaultValue: '#9400D3'
      },
      {
        key: 'glowColor',
        type: PropertyType.COLOR,
        label: '빛 색상',
        defaultValue: '#E6E6FA'
      },
      {
        key: 'runeCount',
        type: PropertyType.RANGE,
        label: '룬 개수',
        min: 4,
        max: 12,
        step: 1,
        defaultValue: 8
      }
    ]
  })
  .inherit('transform')
  .build()

export const MagicCircleDefinition = {
  metadata: {
    type: 'fantasy_magic_circle',
    name: '마법진',
    category: 'fantasy' as ObjectCategory,
    icon: '⭕',
    description: '신비로운 마법진',
    tags: ['fantasy', 'magic', 'circle', 'spell', 'mystical']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 3,
      snapToGrid: true,
      gridSize: 0.5
    },
    interactions: {
      clickable: true,
      hoverable: true,
      draggable: true,
      selectable: true
    },
    materials: {
      default: {
        type: 'standard' as const,
        color: '#9400D3'
      }
    }
  },
  component: MagicCircleObject,
  propertySchema: magicCircleSchema
}