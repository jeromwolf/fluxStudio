import React from 'react'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'
import * as THREE from 'three'

export function RockObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const rockColor = object.state?.rockColor || '#808080'
  const roughness = object.state?.roughness || 0.9
  
  return (
    <group>
      <mesh>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
          color={rockColor}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
          roughness={roughness}
          metalness={0}
        />
      </mesh>
      
      {isSelected && (
        <mesh>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#00ff00" wireframe />
        </mesh>
      )}
    </group>
  )
}

export const rockSchema = new PropertyBuilder()
  .addGroup({
    id: 'material',
    label: 'Material',
    icon: '🪨',
    properties: [
      {
        key: 'rockColor',
        type: PropertyType.COLOR,
        label: 'Color',
        defaultValue: '#808080'
      },
      {
        key: 'roughness',
        type: PropertyType.RANGE,
        label: 'Roughness',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.9
      }
    ]
  })
  .inherit('transform')
  .build()

export const RockDefinition = {
  metadata: {
    type: 'nature_rock',
    name: 'Rock',
    category: 'nature' as ObjectCategory,
    icon: '🪨',
    description: 'A natural rock formation',
    tags: ['nature', 'rock', 'stone', 'terrain']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.3,
      maxScale: 5,
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
        color: '#808080'
      }
    }
  },
  component: RockObject,
  propertySchema: rockSchema
}