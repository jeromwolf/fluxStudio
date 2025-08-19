import React from 'react'
import { Box, Cylinder, Torus } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, SelectProperty } from '../../object-system/property-system'
import * as THREE from 'three'

export function RollerCoasterObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const trackColor = object.state?.trackColor || '#FF0000'
  const supportColor = object.state?.supportColor || '#808080'
  
  return (
    <group>
      {/* Track Loop */}
      <Torus
        args={[3, 0.2, 8, 16]}
        position={[0, 3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={trackColor}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
          metalness={0.8}
          roughness={0.2}
        />
      </Torus>
      
      {/* Support Pillars */}
      {[
        [3, 0], [-3, 0], [0, 3], [0, -3],
        [2.1, 2.1], [-2.1, 2.1], [2.1, -2.1], [-2.1, -2.1]
      ].map((pos, i) => (
        <Cylinder
          key={i}
          args={[0.1, 0.15, 3]}
          position={[pos[0], 1.5, pos[1]]}
        >
          <meshStandardMaterial
            color={supportColor}
            metalness={0.7}
            roughness={0.3}
          />
        </Cylinder>
      ))}
      
      {/* Base Platform */}
      <Box args={[7, 0.2, 7]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[7, 6, 7]} position={[0, 3, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const rollerCoasterSchema = new PropertyBuilder()
  .addGroup({
    id: 'colors',
    label: 'Colors',
    icon: '🎨',
    properties: [
      {
        key: 'trackColor',
        type: PropertyType.COLOR,
        label: 'Track Color',
        defaultValue: '#FF0000'
      },
      {
        key: 'supportColor',
        type: PropertyType.COLOR,
        label: 'Support Color',
        defaultValue: '#808080'
      }
    ]
  })
  .inherit('transform')
  .build()

export const RollerCoasterDefinition = {
  metadata: {
    type: 'amusement_roller_coaster',
    name: 'Roller Coaster',
    category: 'amusement' as ObjectCategory,
    icon: '🎢',
    description: 'A thrilling roller coaster loop',
    tags: ['amusement', 'ride', 'roller-coaster', 'thrill']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 3,
      snapToGrid: true,
      gridSize: 1
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
        color: '#FF0000'
      }
    }
  },
  component: RollerCoasterObject,
  propertySchema: rollerCoasterSchema
}