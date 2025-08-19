import React from 'react'
import { Cylinder, Box } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../../object-system/types'
import { PropertyBuilder, PropertyType, RangeProperty, SelectProperty } from '../../../object-system/property-system'

export function StoolObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#8B4513' }
  const height = object.state?.height || 0.6
  const style = object.state?.style || 'round'
  const hasFootrest = object.state?.hasFootrest !== false
  
  const isRound = style === 'round'
  const isSquare = style === 'square'
  
  return (
    <group>
      {/* Seat */}
      {isRound ? (
        <Cylinder
          args={[0.2, 0.2, 0.08]}
          position={[0, height, 0]}
        >
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : (material.opacity || 1)}
            transparent={isPreview || material.transparent}
            roughness={0.6}
            metalness={0.1}
          />
        </Cylinder>
      ) : (
        <Box
          args={[0.35, 0.08, 0.35]}
          position={[0, height, 0]}
        >
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : (material.opacity || 1)}
            transparent={isPreview || material.transparent}
            roughness={0.6}
            metalness={0.1}
          />
        </Box>
      )}
      
      {/* Legs */}
      {style === 'bar' ? (
        // Bar stool with single pole
        <>
          <Cylinder
            args={[0.03, 0.03, height - 0.04]}
            position={[0, (height - 0.04) / 2, 0]}
          >
            <meshStandardMaterial 
              color="#4A4A4A" 
              metalness={0.8} 
              roughness={0.2} 
            />
          </Cylinder>
          {/* Base */}
          <Cylinder
            args={[0.25, 0.25, 0.03]}
            position={[0, 0.015, 0]}
          >
            <meshStandardMaterial 
              color="#4A4A4A" 
              metalness={0.8} 
              roughness={0.2} 
            />
          </Cylinder>
          {/* Footrest ring */}
          {hasFootrest && (
            <Cylinder
              args={[0.18, 0.18, 0.02]}
              position={[0, height * 0.3, 0]}
            >
              <meshStandardMaterial 
                color="#4A4A4A" 
                metalness={0.8} 
                roughness={0.2} 
              />
            </Cylinder>
          )}
        </>
      ) : (
        // Traditional 4-leg stool
        <>
          {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map((pos, i) => (
            <Cylinder
              key={i}
              args={[0.02, 0.025, height - 0.04]}
              position={[pos[0], (height - 0.04) / 2, pos[1]]}
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
          
          {/* Cross supports for stability */}
          {hasFootrest && (
            <>
              <Box 
                args={[0.3, 0.02, 0.02]} 
                position={[0, height * 0.3, 0]}
              >
                <meshStandardMaterial color={material.color} roughness={0.7} />
              </Box>
              <Box 
                args={[0.02, 0.02, 0.3]} 
                position={[0, height * 0.3, 0]}
              >
                <meshStandardMaterial color={material.color} roughness={0.7} />
              </Box>
            </>
          )}
        </>
      )}
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[0.4, height + 0.1, 0.4]} position={[0, (height + 0.1) / 2, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

// Property schema for stool
export const stoolSchema = new PropertyBuilder()
  .addGroup({
    id: 'dimensions',
    label: 'Dimensions',
    icon: '📏',
    properties: [
      {
        key: 'height',
        type: PropertyType.RANGE,
        label: 'Height',
        min: 0.4,
        max: 0.8,
        step: 0.05,
        defaultValue: 0.6,
        showValue: true
      } as RangeProperty
    ]
  })
  .addGroup({
    id: 'style',
    label: 'Style',
    icon: '🎨',
    properties: [
      {
        key: 'style',
        type: PropertyType.SELECT,
        label: 'Stool Style',
        options: [
          { value: 'round', label: 'Round' },
          { value: 'square', label: 'Square' },
          { value: 'bar', label: 'Bar Stool' }
        ],
        defaultValue: 'round'
      } as SelectProperty,
      {
        key: 'hasFootrest',
        type: PropertyType.BOOLEAN,
        label: 'Footrest',
        defaultValue: true
      }
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Stool definition
export const StoolDefinition = {
  metadata: {
    type: 'furniture_chair_stool',
    name: 'Stool',
    category: ObjectCategory.FURNITURE,
    icon: '🪑',
    description: 'A versatile stool for various uses',
    tags: ['furniture', 'chair', 'stool', 'seating', 'bar', 'kitchen']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.7,
      maxScale: 1.5,
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
        roughness: 0.6,
        metalness: 0.1
      },
      variants: {
        wood: { color: '#8B4513' },
        metal: { color: '#C0C0C0', metalness: 0.8 },
        white: { color: '#FFFFFF' },
        black: { color: '#1A1A1A' }
      }
    }
  },
  component: StoolObject,
  propertySchema: stoolSchema
}