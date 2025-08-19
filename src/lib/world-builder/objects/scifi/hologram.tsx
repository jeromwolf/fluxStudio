import React from 'react'
import { Box, Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, SelectProperty } from '../../object-system/property-system'
import * as THREE from 'three'

export function HologramObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const hologramType = object.state?.hologramType || 'globe'
  const hologramColor = object.state?.hologramColor || '#00FF00'
  const baseColor = object.state?.baseColor || '#333333'
  
  const renderHologram = () => {
    if (hologramType === 'globe') {
      return (
        <>
          {/* Globe */}
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial 
              color={hologramColor}
              emissive={hologramColor}
              emissiveIntensity={0.5}
              opacity={0.3}
              transparent
              wireframe
            />
          </mesh>
          {/* Latitude lines */}
          {[-0.3, 0, 0.3].map((y, i) => (
            <mesh key={`lat-${i}`} position={[0, 1.5 + y, 0]}>
              <ringGeometry args={[0.5 * Math.sqrt(1 - (y/0.6)**2), 0.52 * Math.sqrt(1 - (y/0.6)**2), 32]} />
              <meshBasicMaterial color={hologramColor} opacity={0.5} transparent />
            </mesh>
          ))}
        </>
      )
    } else if (hologramType === 'data') {
      return (
        <>
          {/* Data bars */}
          {[0, 0.3, 0.6, 0.9].map((x, i) => (
            <Box 
              key={`bar-${i}`} 
              args={[0.15, 0.8 + Math.random() * 0.5, 0.15]} 
              position={[x - 0.45, 1.5, 0]}
            >
              <meshStandardMaterial 
                color={hologramColor}
                emissive={hologramColor}
                emissiveIntensity={0.5}
                opacity={0.4}
                transparent
              />
            </Box>
          ))}
          {/* Grid lines */}
          <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.8]} />
            <meshBasicMaterial 
              color={hologramColor}
              opacity={0.2}
              transparent
              wireframe
            />
          </mesh>
        </>
      )
    } else {
      // person
      return (
        <>
          {/* Head */}
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial 
              color={hologramColor}
              emissive={hologramColor}
              emissiveIntensity={0.5}
              opacity={0.4}
              transparent
            />
          </mesh>
          {/* Body */}
          <Box args={[0.3, 0.6, 0.15]} position={[0, 1.7, 0]}>
            <meshStandardMaterial 
              color={hologramColor}
              emissive={hologramColor}
              emissiveIntensity={0.5}
              opacity={0.4}
              transparent
            />
          </Box>
          {/* Arms */}
          <Box args={[0.5, 0.1, 0.1]} position={[0, 1.85, 0]}>
            <meshStandardMaterial 
              color={hologramColor}
              emissive={hologramColor}
              emissiveIntensity={0.5}
              opacity={0.4}
              transparent
            />
          </Box>
          {/* Legs */}
          <Box args={[0.1, 0.5, 0.1]} position={[-0.1, 1.15, 0]}>
            <meshStandardMaterial 
              color={hologramColor}
              emissive={hologramColor}
              emissiveIntensity={0.5}
              opacity={0.4}
              transparent
            />
          </Box>
          <Box args={[0.1, 0.5, 0.1]} position={[0.1, 1.15, 0]}>
            <meshStandardMaterial 
              color={hologramColor}
              emissive={hologramColor}
              emissiveIntensity={0.5}
              opacity={0.4}
              transparent
            />
          </Box>
        </>
      )
    }
  }
  
  return (
    <group>
      {/* Base platform */}
      <Cylinder args={[0.8, 0.8, 0.2]} position={[0, 0.1, 0]}>
        <meshStandardMaterial 
          color={baseColor}
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>
      
      {/* Emitter ring */}
      <Cylinder args={[0.7, 0.7, 0.05, 32, 1, true]} position={[0, 0.25, 0]}>
        <meshStandardMaterial 
          color={hologramColor}
          emissive={hologramColor}
          emissiveIntensity={0.3}
        />
      </Cylinder>
      
      {/* Light beams */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 0.6
        const z = Math.sin(rad) * 0.6
        
        return (
          <Cylinder 
            key={`beam-${i}`}
            args={[0.02, 0.02, 2.5]} 
            position={[x, 1.5, z]}
          >
            <meshBasicMaterial 
              color={hologramColor}
              opacity={0.2}
              transparent
            />
          </Cylinder>
        )
      })}
      
      {/* Hologram content */}
      {renderHologram()}
      
      {/* Scanning effect */}
      <Cylinder args={[0.7, 0.7, 0.01, 32, 1, true]} position={[0, 1.5, 0]}>
        <meshBasicMaterial 
          color={hologramColor}
          opacity={0.3}
          transparent
        />
      </Cylinder>
      
      {isSelected && (
        <Box args={[2, 3, 2]} position={[0, 1.5, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const hologramSchema = new PropertyBuilder()
  .addGroup({
    id: 'type',
    label: '홀로그램 타입',
    icon: '🔮',
    properties: [
      {
        key: 'hologramType',
        type: PropertyType.SELECT,
        label: '타입',
        options: [
          { value: 'globe', label: '지구본' },
          { value: 'data', label: '데이터 차트' },
          { value: 'person', label: '인물' }
        ],
        defaultValue: 'globe'
      } as SelectProperty,
      {
        key: 'hologramColor',
        type: PropertyType.COLOR,
        label: '홀로그램 색상',
        defaultValue: '#00FF00'
      },
      {
        key: 'baseColor',
        type: PropertyType.COLOR,
        label: '베이스 색상',
        defaultValue: '#333333'
      }
    ]
  })
  .inherit('transform')
  .build()

export const HologramDefinition = {
  metadata: {
    type: 'scifi_hologram',
    name: '홀로그램',
    category: 'scifi' as ObjectCategory,
    icon: '🔮',
    description: '3D 홀로그래픽 프로젝터',
    tags: ['scifi', 'hologram', 'projection', 'tech']
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
        color: '#00FF00'
      }
    }
  },
  component: HologramObject,
  propertySchema: hologramSchema
}