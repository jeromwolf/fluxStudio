import React from 'react'
import { Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'
import * as THREE from 'three'

export function DragonEggObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const eggColor = object.state?.eggColor || '#8B0000'
  const patternColor = object.state?.patternColor || '#FFD700'
  const nestColor = object.state?.nestColor || '#8B4513'
  
  return (
    <group>
      {/* Nest base */}
      <Cylinder args={[0.8, 1, 0.3]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={nestColor} roughness={0.9} />
      </Cylinder>
      
      {/* Nest twigs (simplified) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 0.7
        const z = Math.sin(rad) * 0.7
        
        return (
          <mesh key={`twig-${i}`} position={[x * 0.5, 0.25, z * 0.5]} rotation={[0, rad, 0.3]}>
            <boxGeometry args={[0.4, 0.05, 0.05]} />
            <meshStandardMaterial color={nestColor} roughness={0.9} />
          </mesh>
        )
      })}
      
      {/* Dragon egg */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.5, 16, 24]} />
        <meshStandardMaterial 
          color={eggColor}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Egg top (more pointed) */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.35, 0.4, 16]} />
        <meshStandardMaterial 
          color={eggColor}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Scale patterns */}
      {Array.from({ length: 8 }).map((_, row) => {
        const y = 0.5 + row * 0.15
        const radius = 0.48 * Math.sqrt(1 - ((y - 0.8) / 0.7) ** 2)
        const count = Math.floor(radius * 20)
        
        return Array.from({ length: count }).map((_, i) => {
          const angle = (i / count) * Math.PI * 2 + (row % 2) * 0.2
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          
          return (
            <mesh key={`scale-${row}-${i}`} position={[x, y, z]}>
              <circleGeometry args={[0.05, 6]} />
              <meshStandardMaterial 
                color={patternColor}
                emissive={patternColor}
                emissiveIntensity={0.1}
                metalness={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })
      }).flat()}
      
      {/* Magical glow */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color={patternColor}
          emissive={patternColor}
          emissiveIntensity={0.2}
          opacity={0.1}
          transparent
        />
      </mesh>
      
      {/* Heat shimmer particles */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 0.4
        const z = Math.sin(rad) * 0.4
        const y = 1.5 + Math.sin(Date.now() * 0.001 + i) * 0.3
        
        return (
          <mesh key={`heat-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial 
              color="#FF4500"
              emissive="#FF4500"
              emissiveIntensity={1}
              opacity={0.6}
              transparent
            />
          </mesh>
        )
      })}
      
      {isSelected && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#00ff00" wireframe />
        </mesh>
      )}
    </group>
  )
}

export const dragonEggSchema = new PropertyBuilder()
  .addGroup({
    id: 'appearance',
    label: '외관',
    icon: '🥚',
    properties: [
      {
        key: 'eggColor',
        type: PropertyType.COLOR,
        label: '알 색상',
        defaultValue: '#8B0000'
      },
      {
        key: 'patternColor',
        type: PropertyType.COLOR,
        label: '무늬 색상',
        defaultValue: '#FFD700'
      },
      {
        key: 'nestColor',
        type: PropertyType.COLOR,
        label: '둥지 색상',
        defaultValue: '#8B4513'
      }
    ]
  })
  .inherit('transform')
  .build()

export const DragonEggDefinition = {
  metadata: {
    type: 'fantasy_dragon_egg',
    name: '드래곤 알',
    category: 'fantasy' as ObjectCategory,
    icon: '🥚',
    description: '신비로운 드래곤의 알',
    tags: ['fantasy', 'dragon', 'egg', 'magical', 'creature']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 2,
      snapToGrid: true,
      gridSize: 0.25
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
        color: '#8B0000'
      }
    }
  },
  component: DragonEggObject,
  propertySchema: dragonEggSchema
}