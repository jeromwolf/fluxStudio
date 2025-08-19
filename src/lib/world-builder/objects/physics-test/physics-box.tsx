import React from 'react'
import { Box } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'

export function PhysicsBoxObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#ff4444' }
  const size = object.state?.size || 1
  
  return (
    <Box args={[size, size, size]}>
      <meshStandardMaterial
        color={material.color}
        opacity={isPreview ? 0.7 : (material.opacity || 1)}
        transparent={isPreview || material.transparent}
        roughness={0.3}
        metalness={0.1}
        emissive={isSelected ? material.color : 'black'}
        emissiveIntensity={isSelected ? 0.2 : 0}
      />
    </Box>
  )
}

export const PhysicsBoxDefinition = {
  metadata: {
    type: 'physics_box',
    name: 'Physics Box',
    category: ObjectCategory.BASIC,
    icon: '📦',
    tags: ['physics', 'test', 'dynamic'],
    description: 'A box with physics enabled for testing'
  },
  config: {
    defaultProperties: {
      position: { x: 0, y: 5, z: 0 }
    },
    interactions: {
      clickable: true,
      hoverable: true,
      draggable: true,
      selectable: true,
      physics: {
        enabled: true,
        type: 'dynamic',
        mass: 1,
        friction: 0.5,
        restitution: 0.3,
        shape: { type: 'box', size: { x: 1, y: 1, z: 1 } }
      }
    },
    materials: {
      default: { 
        color: '#ff4444',
        type: 'standard' as const
      },
      variants: {
        blue: { color: '#4444ff' },
        green: { color: '#44ff44' },
        yellow: { color: '#ffff44' }
      }
    }
  },
  component: PhysicsBoxObject,
  propertySchema: new PropertyBuilder()
    .addGroup({
      id: 'physics',
      label: 'Physics Properties',
      properties: [
        {
          key: 'mass',
          type: PropertyType.RANGE,
          label: 'Mass',
          min: 0.1,
          max: 10,
          step: 0.1,
          defaultValue: 1
        },
        {
          key: 'restitution',
          type: PropertyType.RANGE,
          label: 'Bounciness',
          min: 0,
          max: 1,
          step: 0.1,
          defaultValue: 0.3
        },
        {
          key: 'friction',
          type: PropertyType.RANGE,
          label: 'Friction',
          min: 0,
          max: 1,
          step: 0.1,
          defaultValue: 0.5
        }
      ]
    })
    .addGroup({
      id: 'appearance',
      label: 'Appearance',
      properties: [
        {
          key: 'size',
          type: PropertyType.RANGE,
          label: 'Size',
          min: 0.5,
          max: 3,
          step: 0.1,
          defaultValue: 1
        }
      ]
    })
    .build()
}