import React from 'react'
import { Cone, Cylinder, Box } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, SelectProperty } from '../../object-system/property-system'

export function SpaceshipObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const shipType = object.state?.shipType || 'fighter'
  const hullColor = object.state?.hullColor || '#C0C0C0'
  const accentColor = object.state?.accentColor || '#00FFFF'
  
  if (shipType === 'fighter') {
    return (
      <group>
        {/* Main hull */}
        <Cone args={[0.5, 2, 8]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial 
            color={hullColor}
            metalness={0.8}
            roughness={0.2}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
          />
        </Cone>
        
        {/* Cockpit */}
        <mesh position={[0, 0, -0.5]}>
          <sphereGeometry args={[0.3, 16, 8]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.3} />
        </mesh>
        
        {/* Wings */}
        <Box args={[2, 0.1, 0.6]} position={[0, 0, 0.3]}>
          <meshStandardMaterial color={hullColor} metalness={0.8} />
        </Box>
        
        {/* Engines */}
        <Cylinder args={[0.15, 0.15, 0.5]} position={[-0.7, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} />
        </Cylinder>
        <Cylinder args={[0.15, 0.15, 0.5]} position={[0.7, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} />
        </Cylinder>
        
        {isSelected && (
          <Box args={[2.5, 1, 3]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#00ff00" wireframe />
          </Box>
        )}
      </group>
    )
  } else {
    // Cargo ship
    return (
      <group>
        {/* Main body */}
        <Box args={[1.5, 0.8, 3]}>
          <meshStandardMaterial color={hullColor} metalness={0.7} roughness={0.3} />
        </Box>
        
        {/* Cargo containers */}
        <Box args={[0.4, 0.3, 0.6]} position={[-0.4, 0.5, -0.8]}>
          <meshStandardMaterial color="#FFA500" />
        </Box>
        <Box args={[0.4, 0.3, 0.6]} position={[0, 0.5, -0.8]}>
          <meshStandardMaterial color="#FF0000" />
        </Box>
        <Box args={[0.4, 0.3, 0.6]} position={[0.4, 0.5, -0.8]}>
          <meshStandardMaterial color="#0000FF" />
        </Box>
        
        {/* Bridge */}
        <Box args={[0.6, 0.4, 0.4]} position={[0, 0.6, 0.8]}>
          <meshStandardMaterial color={accentColor} />
        </Box>
        
        {/* Engines */}
        <Cylinder args={[0.3, 0.2, 0.8]} position={[-0.5, -0.3, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#0080FF" emissive="#0080FF" emissiveIntensity={0.5} />
        </Cylinder>
        <Cylinder args={[0.3, 0.2, 0.8]} position={[0.5, -0.3, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#0080FF" emissive="#0080FF" emissiveIntensity={0.5} />
        </Cylinder>
        
        {isSelected && (
          <Box args={[2, 2, 4]} position={[0, 0, 0]}>
            <meshBasicMaterial color="#00ff00" wireframe />
          </Box>
        )}
      </group>
    )
  }
}

export const spaceshipSchema = new PropertyBuilder()
  .addGroup({
    id: 'type',
    label: '우주선 타입',
    icon: '🚀',
    properties: [
      {
        key: 'shipType',
        type: PropertyType.SELECT,
        label: '타입',
        options: [
          { value: 'fighter', label: '전투기' },
          { value: 'cargo', label: '화물선' }
        ],
        defaultValue: 'fighter'
      } as SelectProperty,
      {
        key: 'hullColor',
        type: PropertyType.COLOR,
        label: '선체 색상',
        defaultValue: '#C0C0C0'
      },
      {
        key: 'accentColor',
        type: PropertyType.COLOR,
        label: '강조 색상',
        defaultValue: '#00FFFF'
      }
    ]
  })
  .inherit('transform')
  .build()

export const SpaceshipDefinition = {
  metadata: {
    type: 'scifi_spaceship',
    name: '우주선',
    category: 'scifi' as ObjectCategory,
    icon: '🚀',
    description: '미래형 우주선',
    tags: ['scifi', 'spaceship', 'vehicle', 'future']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 3,
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
        color: '#C0C0C0'
      }
    }
  },
  component: SpaceshipObject,
  propertySchema: spaceshipSchema
}