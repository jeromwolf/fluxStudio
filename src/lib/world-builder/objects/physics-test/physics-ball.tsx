import React from 'react'
import { Sphere } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'

export function PhysicsBallObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#00ffff' }
  const radius = object.state?.radius || 0.5
  
  return (
    <Sphere args={[radius, 32, 16]}>
      <meshStandardMaterial
        color={material.color}
        opacity={isPreview ? 0.7 : (material.opacity || 1)}
        transparent={isPreview || material.transparent}
        roughness={0.2}
        metalness={0.3}
        emissive={isSelected ? material.color : 'black'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </Sphere>
  )
}

export const PhysicsBallDefinition = {
  metadata: {
    type: 'physics_ball',
    name: 'Physics Ball',
    category: ObjectCategory.BASIC,
    icon: '⚪',
    tags: ['physics', 'test', 'dynamic', 'bouncy'],
    description: 'A bouncy ball with physics enabled'
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
        mass: 0.5,
        friction: 0.2,
        restitution: 0.8, // High bounce!
        shape: { type: 'sphere', radius: 0.5 }
      }
    },
    materials: {
      default: { 
        color: '#00ffff',
        type: 'standard' as const
      },
      variants: {
        red: { color: '#ff0000' },
        green: { color: '#00ff00' },
        yellow: { color: '#ffff00' },
        purple: { color: '#ff00ff' }
      }
    }
  },
  component: PhysicsBallObject,
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
          max: 5,
          step: 0.1,
          defaultValue: 0.5
        },
        {
          key: 'restitution',
          type: PropertyType.RANGE,
          label: 'Bounciness',
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.8
        },
        {
          key: 'friction',
          type: PropertyType.RANGE,
          label: 'Friction',
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.2
        }
      ]
    })
    .addGroup({
      id: 'appearance',
      label: 'Appearance',
      properties: [
        {
          key: 'radius',
          type: PropertyType.RANGE,
          label: 'Radius',
          min: 0.3,
          max: 2,
          step: 0.1,
          defaultValue: 0.5
        }
      ]
    })
    .build()
}