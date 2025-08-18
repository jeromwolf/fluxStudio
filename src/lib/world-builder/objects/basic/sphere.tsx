import React from 'react'
import { Sphere } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, RangeProperty } from '../../object-system/property-system'

export function SphereObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#808080' }
  const radius = object.state?.radius || 0.5
  const segments = object.state?.segments || 32
  
  return (
    <Sphere
      args={[radius, segments, segments]}
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
    </Sphere>
  )
}

// Property schema for sphere
export const sphereSchema = new PropertyBuilder()
  .addGroup({
    id: 'geometry',
    label: 'Geometry',
    icon: '🌐',
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
        key: 'segments',
        type: PropertyType.RANGE,
        label: 'Segments',
        min: 8,
        max: 64,
        step: 4,
        defaultValue: 32,
        showValue: true
      } as RangeProperty,
      {
        key: 'thetaLength',
        type: PropertyType.RANGE,
        label: 'Theta Length',
        min: 0,
        max: Math.PI * 2,
        step: 0.1,
        defaultValue: Math.PI * 2,
        showValue: true
      } as RangeProperty
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Sphere definition
export const SphereDefinition = {
  metadata: {
    type: 'sphere',
    name: 'Sphere',
    category: ObjectCategory.BASIC,
    icon: '🔵',
    description: 'A basic sphere shape',
    tags: ['basic', 'primitive', 'ball', 'round']
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
        color: '#4169E1',
        metalness: 0.5,
        roughness: 0.5
      },
      variants: {
        glass: {
          type: 'physical' as const,
          color: '#ffffff',
          metalness: 0,
          roughness: 0,
          opacity: 0.3,
          transparent: true
        },
        metal: {
          type: 'standard' as const,
          color: '#C0C0C0',
          metalness: 1,
          roughness: 0.2
        }
      },
      allowColorChange: true
    }
  },
  component: SphereObject
}