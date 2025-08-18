import React from 'react'
import { Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, RangeProperty } from '../../object-system/property-system'

export function CylinderObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#808080' }
  const radius = object.state?.radius || 0.5
  const height = object.state?.height || 1
  const segments = object.state?.segments || 32
  
  return (
    <Cylinder
      args={[radius, radius, height, segments]}
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
    </Cylinder>
  )
}

// Property schema for cylinder
export const cylinderSchema = new PropertyBuilder()
  .addGroup({
    id: 'geometry',
    label: 'Geometry',
    icon: '🔩',
    properties: [
      {
        key: 'radius',
        type: PropertyType.RANGE,
        label: 'Radius',
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
        defaultValue: 32,
        showValue: true
      } as RangeProperty
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Cylinder definition
export const CylinderDefinition = {
  metadata: {
    type: 'cylinder',
    name: 'Cylinder',
    category: ObjectCategory.BASIC,
    icon: '🔩',
    description: 'A basic cylinder shape',
    tags: ['basic', 'primitive', 'cylinder', 'tube']
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
        color: '#FF6347',
        metalness: 0.3,
        roughness: 0.7
      },
      allowColorChange: true
    }
  },
  component: CylinderObject
}