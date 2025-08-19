import React from 'react'
import { Box, Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../../object-system/types'
import { PropertyBuilder, PropertyType, SelectProperty } from '../../../object-system/property-system'

export function DiningChairObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#D2691E' }
  const style = object.state?.style || 'classic'
  
  // Different styles have different designs
  const isModern = style === 'modern'
  const seatHeight = 0.45
  
  return (
    <group>
      {/* Seat */}
      <Box
        args={[0.45, 0.06, 0.45]}
        position={[0, seatHeight, 0]}
      >
        <meshStandardMaterial
          color={material.color}
          opacity={isPreview ? 0.7 : (material.opacity || 1)}
          transparent={isPreview || material.transparent}
          roughness={0.6}
          metalness={0.1}
        />
      </Box>
      
      {/* Backrest */}
      {isModern ? (
        // Modern style - solid back
        <Box
          args={[0.45, 0.5, 0.06]}
          position={[0, seatHeight + 0.28, -0.195]}
        >
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : (material.opacity || 1)}
            transparent={isPreview || material.transparent}
            roughness={0.6}
            metalness={0.1}
          />
        </Box>
      ) : (
        // Classic style - vertical slats
        <>
          {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
            <Box
              key={i}
              args={[0.04, 0.5, 0.04]}
              position={[x, seatHeight + 0.28, -0.195]}
            >
              <meshStandardMaterial
                color={material.color}
                roughness={0.6}
                metalness={0.1}
              />
            </Box>
          ))}
          {/* Top rail */}
          <Box
            args={[0.45, 0.08, 0.04]}
            position={[0, seatHeight + 0.5, -0.195]}
          >
            <meshStandardMaterial
              color={material.color}
              roughness={0.6}
              metalness={0.1}
            />
          </Box>
        </>
      )}
      
      {/* Legs - tapered for elegance */}
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map((pos, i) => (
        <Cylinder
          key={i}
          args={[0.025, 0.035, seatHeight - 0.03]}
          position={[pos[0], (seatHeight - 0.03) / 2, pos[1]]}
        >
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : (material.opacity || 1)}
            transparent={isPreview || material.transparent}
            roughness={0.7}
            metalness={0.1}
          />
        </Cylinder>
      ))}
      
      {/* Leg supports for stability */}
      {!isModern && (
        <>
          <Box args={[0.4, 0.03, 0.03]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color={material.color} roughness={0.7} />
          </Box>
          <Box args={[0.03, 0.03, 0.4]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color={material.color} roughness={0.7} />
          </Box>
        </>
      )}
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[0.5, 1, 0.5]} position={[0, 0.5, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

// Property schema for dining chair
export const diningChairSchema = new PropertyBuilder()
  .addGroup({
    id: 'style',
    label: 'Style',
    icon: '🎨',
    properties: [
      {
        key: 'style',
        type: PropertyType.SELECT,
        label: 'Chair Style',
        options: [
          { value: 'classic', label: 'Classic' },
          { value: 'modern', label: 'Modern' }
        ],
        defaultValue: 'classic'
      } as SelectProperty
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Dining Chair definition
export const DiningChairDefinition = {
  metadata: {
    type: 'furniture_chair_dining',
    name: 'Dining Chair',
    category: ObjectCategory.FURNITURE,
    icon: '🪑',
    description: 'An elegant dining room chair',
    tags: ['furniture', 'chair', 'dining', 'seating', 'kitchen']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.8,
      maxScale: 1.3,
      snapToGrid: true,
      gridSize: 0.1
    },
    interactions: {
      clickable: true,
      hoverable: true,
      draggable: true,
      selectable: true,
      sittable: true
    },
    materials: {
      default: {
        type: 'standard' as const,
        color: '#D2691E',
        roughness: 0.6,
        metalness: 0.1
      },
      variants: {
        oak: { color: '#D2691E' },
        walnut: { color: '#5D4E37' },
        white: { color: '#F5F5F5' },
        black: { color: '#1A1A1A' }
      }
    }
  },
  component: DiningChairObject,
  propertySchema: diningChairSchema
}