import React from 'react'
import { Box } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../../object-system/types'
import { PropertyBuilder, PropertyType, RangeProperty, SelectProperty } from '../../../object-system/property-system'

export function BasicChairObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#8B4513' }
  const seatHeight = object.state?.seatHeight || 0.45
  const backHeight = object.state?.backHeight || 0.8
  
  return (
    <group>
      {/* Seat */}
      <Box
        args={[0.45, 0.05, 0.45]}
        position={[0, seatHeight, 0]}
      >
        <meshStandardMaterial
          color={material.color}
          opacity={isPreview ? 0.7 : (material.opacity || 1)}
          transparent={isPreview || material.transparent}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
      
      {/* Backrest */}
      <Box
        args={[0.45, backHeight - seatHeight, 0.05]}
        position={[0, (backHeight + seatHeight) / 2, -0.2]}
      >
        <meshStandardMaterial
          color={material.color}
          opacity={isPreview ? 0.7 : (material.opacity || 1)}
          transparent={isPreview || material.transparent}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
      
      {/* Legs */}
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map((pos, i) => (
        <Box
          key={i}
          args={[0.04, seatHeight - 0.025, 0.04]}
          position={[pos[0], (seatHeight - 0.025) / 2, pos[1]]}
        >
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : (material.opacity || 1)}
            transparent={isPreview || material.transparent}
            roughness={0.8}
            metalness={0.2}
          />
        </Box>
      ))}
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[0.5, 0.85, 0.5]} position={[0, 0.425, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

// Property schema for basic chair
export const basicChairSchema = new PropertyBuilder()
  .addGroup({
    id: 'dimensions',
    label: 'Dimensions',
    icon: '📏',
    properties: [
      {
        key: 'seatHeight',
        type: PropertyType.RANGE,
        label: 'Seat Height',
        min: 0.3,
        max: 0.6,
        step: 0.05,
        defaultValue: 0.45,
        showValue: true
      } as RangeProperty,
      {
        key: 'backHeight',
        type: PropertyType.RANGE,
        label: 'Back Height',
        min: 0.6,
        max: 1.2,
        step: 0.05,
        defaultValue: 0.8,
        showValue: true
      } as RangeProperty
    ]
  })
  .addGroup({
    id: 'material',
    label: 'Material',
    icon: '🎨',
    properties: [
      {
        key: 'material',
        type: PropertyType.SELECT,
        label: 'Material Type',
        options: [
          { value: 'wood', label: 'Wood' },
          { value: 'plastic', label: 'Plastic' },
          { value: 'metal', label: 'Metal' }
        ],
        defaultValue: 'wood'
      } as SelectProperty
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Basic Chair definition
export const BasicChairDefinition = {
  metadata: {
    type: 'furniture_chair_basic',
    name: 'Basic Chair',
    category: ObjectCategory.FURNITURE,
    icon: '🪑',
    description: 'A simple wooden chair',
    tags: ['furniture', 'chair', 'seating', 'basic']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 2,
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
        color: '#8B4513',
        roughness: 0.7,
        metalness: 0.1
      },
      variants: {
        wood: { color: '#8B4513' },
        plastic: { color: '#FFFFFF' },
        metal: { color: '#C0C0C0', metalness: 0.8 }
      }
    }
  },
  component: BasicChairObject,
  propertySchema: basicChairSchema
}