import React from 'react'
import { Cone } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, RangeProperty } from '../../object-system/property-system'

export function ConeObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#808080' }
  const radius = object.state?.radius || 0.5
  const height = object.state?.height || 1
  const segments = object.state?.segments || 32
  
  return (
    <Cone
      args={[radius, height, segments]}
      position={[
        object.properties.position.x,
        object.properties.position.y,
        object.properties.position.z
      ]}
      rotation={[
        object.properties.rotation.x,
        object.properties.rotation.y,
        object.properties.rotation.z
      ]}
      scale={[
        object.properties.scale.x,
        object.properties.scale.y,
        object.properties.scale.z
      ]}
    >
      <meshStandardMaterial
        color={material.color}
        opacity={isPreview ? 0.7 : (material.opacity || 1)}
        transparent={isPreview || material.transparent}
        wireframe={isSelected}
        metalness={material.metalness}
        roughness={material.roughness}
      />
    </Cone>
  )
}

// Property schema for cone
export const coneSchema = new PropertyBuilder()
  .addGroup({
    id: 'geometry',
    label: 'Geometry',
    icon: '🔺',
    properties: [
      {
        key: 'radius',
        type: PropertyType.RANGE,
        label: 'Base Radius',
        min: 0.1,
        max: 5,
        step: 0.1,
        defaultValue: 0.5,
        showValue: true
      } as RangeProperty,
      {
        key: 'height',
        type: PropertyType.RANGE,
        label: 'Height',
        min: 0.1,
        max: 10,
        step: 0.1,
        defaultValue: 1,
        showValue: true
      } as RangeProperty,
      {
        key: 'segments',
        type: PropertyType.RANGE,
        label: 'Segments',
        min: 3,
        max: 64,
        step: 1,
        defaultValue: 8,
        showValue: true
      } as RangeProperty
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Cone definition
export const ConeDefinition = {
  metadata: {
    type: 'cone',
    name: 'Cone',
    category: ObjectCategory.BASIC,
    icon: '🔺',
    description: 'A basic cone shape',
    tags: ['basic', 'primitive', 'cone', 'pyramid']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.1,
      maxScale: 10,
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
        color: '#FFD700',
        metalness: 0.4,
        roughness: 0.6
      },
      allowColorChange: true
    }
  },
  component: ConeObject
}