import React from 'react'
import { Box, Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../../object-system/types'
import { PropertyBuilder, PropertyType, RangeProperty, BooleanProperty } from '../../../object-system/property-system'

export function OfficeChairObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#2C2C2C' }
  const seatHeight = object.state?.seatHeight || 0.5
  const hasArmrests = object.state?.hasArmrests !== false
  const hasWheels = object.state?.hasWheels !== false
  
  return (
    <group>
      {/* Seat */}
      <Box
        args={[0.5, 0.1, 0.5]}
        position={[0, seatHeight, 0]}
      >
        <meshStandardMaterial
          color={material.color}
          opacity={isPreview ? 0.7 : (material.opacity || 1)}
          transparent={isPreview || material.transparent}
          roughness={0.5}
          metalness={0}
        />
      </Box>
      
      {/* Backrest */}
      <Box
        args={[0.5, 0.6, 0.08]}
        position={[0, seatHeight + 0.35, -0.21]}
      >
        <meshStandardMaterial
          color={material.color}
          opacity={isPreview ? 0.7 : (material.opacity || 1)}
          transparent={isPreview || material.transparent}
          roughness={0.5}
          metalness={0}
        />
      </Box>
      
      {/* Armrests */}
      {hasArmrests && (
        <>
          <Box
            args={[0.05, 0.15, 0.3]}
            position={[-0.275, seatHeight + 0.125, 0]}
          >
            <meshStandardMaterial color={material.color} roughness={0.5} />
          </Box>
          <Box
            args={[0.05, 0.15, 0.3]}
            position={[0.275, seatHeight + 0.125, 0]}
          >
            <meshStandardMaterial color={material.color} roughness={0.5} />
          </Box>
        </>
      )}
      
      {/* Central pole */}
      <Cylinder
        args={[0.03, 0.03, seatHeight - 0.1]}
        position={[0, (seatHeight - 0.1) / 2, 0]}
      >
        <meshStandardMaterial color="#4A4A4A" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Base */}
      <Cylinder
        args={[0.3, 0.3, 0.05]}
        position={[0, 0.025, 0]}
      >
        <meshStandardMaterial color="#4A4A4A" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Wheels */}
      {hasWheels && (
        <>
          {[[0.25, 0], [-0.25, 0], [0, 0.25], [0, -0.25], [0.18, 0.18]].map((pos, i) => (
            <Cylinder
              key={i}
              args={[0.03, 0.03, 0.03]}
              position={[pos[0], 0.05, pos[1]]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
            </Cylinder>
          ))}
        </>
      )}
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[0.6, 1.2, 0.6]} position={[0, 0.6, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

// Property schema for office chair
export const officeChairSchema = new PropertyBuilder()
  .addGroup({
    id: 'dimensions',
    label: 'Dimensions',
    icon: '📏',
    properties: [
      {
        key: 'seatHeight',
        type: PropertyType.RANGE,
        label: 'Seat Height',
        min: 0.4,
        max: 0.7,
        step: 0.05,
        defaultValue: 0.5,
        showValue: true
      } as RangeProperty
    ]
  })
  .addGroup({
    id: 'features',
    label: 'Features',
    icon: '⚙️',
    properties: [
      {
        key: 'hasArmrests',
        type: PropertyType.BOOLEAN,
        label: 'Armrests',
        defaultValue: true
      } as BooleanProperty,
      {
        key: 'hasWheels',
        type: PropertyType.BOOLEAN,
        label: 'Wheels',
        defaultValue: true
      } as BooleanProperty
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Office Chair definition
export const OfficeChairDefinition = {
  metadata: {
    type: 'furniture_chair_office',
    name: 'Office Chair',
    category: ObjectCategory.FURNITURE,
    icon: '💺',
    description: 'An ergonomic office chair with wheels',
    tags: ['furniture', 'chair', 'office', 'seating', 'work']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.8,
      maxScale: 1.5,
      snapToGrid: true,
      gridSize: 0.1
    },
    interactions: {
      clickable: true,
      hoverable: true,
      draggable: true,
      selectable: true,
      sittable: true,
      rotatable: true
    },
    materials: {
      default: {
        type: 'standard' as const,
        color: '#2C2C2C',
        roughness: 0.5,
        metalness: 0
      },
      variants: {
        black: { color: '#2C2C2C' },
        gray: { color: '#808080' },
        blue: { color: '#1E40AF' },
        red: { color: '#DC2626' }
      }
    }
  },
  component: OfficeChairObject,
  propertySchema: officeChairSchema
}