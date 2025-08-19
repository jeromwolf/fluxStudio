import React from 'react'
import { Box, Cylinder, Ring } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'

export function FerrisWheelObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const wheelColor = object.state?.wheelColor || '#4169E1'
  const cabinColor = object.state?.cabinColor || '#FFD700'
  const cabinCount = 8
  
  return (
    <group>
      {/* Central Hub */}
      <Cylinder args={[0.3, 0.3, 0.5]} position={[0, 4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </Cylinder>
      
      {/* Wheel Structure */}
      <Ring args={[2.8, 3, 32]} position={[0, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial 
          color={wheelColor} 
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
          metalness={0.6}
        />
      </Ring>
      
      {/* Spokes */}
      {Array.from({ length: cabinCount }).map((_, i) => {
        const angle = (i / cabinCount) * Math.PI * 2
        return (
          <Box
            key={`spoke-${i}`}
            args={[0.05, 3, 0.05]}
            position={[0, 4, 0]}
            rotation={[0, 0, angle]}
          >
            <meshStandardMaterial color={wheelColor} metalness={0.6} />
          </Box>
        )
      })}
      
      {/* Cabins */}
      {Array.from({ length: cabinCount }).map((_, i) => {
        const angle = (i / cabinCount) * Math.PI * 2
        const x = Math.cos(angle) * 3
        const y = 4 + Math.sin(angle) * 3
        
        return (
          <Box
            key={`cabin-${i}`}
            args={[0.6, 0.8, 0.6]}
            position={[0, y, x]}
          >
            <meshStandardMaterial 
              color={cabinColor}
              opacity={isPreview ? 0.7 : 1}
              transparent={isPreview}
            />
          </Box>
        )
      })}
      
      {/* Support Structure */}
      <Box args={[0.2, 4, 0.2]} position={[-1.5, 2, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.7} />
      </Box>
      <Box args={[0.2, 4, 0.2]} position={[1.5, 2, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.7} />
      </Box>
      
      {/* Base */}
      <Box args={[4, 0.3, 2]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#444444" />
      </Box>
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[6, 8, 6]} position={[0, 4, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const ferrisWheelSchema = new PropertyBuilder()
  .addGroup({
    id: 'colors',
    label: 'Colors',
    icon: '🎨',
    properties: [
      {
        key: 'wheelColor',
        type: PropertyType.COLOR,
        label: 'Wheel Color',
        defaultValue: '#4169E1'
      },
      {
        key: 'cabinColor',
        type: PropertyType.COLOR,
        label: 'Cabin Color',
        defaultValue: '#FFD700'
      }
    ]
  })
  .inherit('transform')
  .build()

export const FerrisWheelDefinition = {
  metadata: {
    type: 'amusement_ferris_wheel',
    name: 'Ferris Wheel',
    category: 'amusement' as ObjectCategory,
    icon: '🎡',
    description: 'A classic ferris wheel',
    tags: ['amusement', 'ride', 'ferris-wheel', 'family']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 2,
      snapToGrid: true,
      gridSize: 1
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
        color: '#4169E1'
      }
    }
  },
  component: FerrisWheelObject,
  propertySchema: ferrisWheelSchema
}