import React from 'react'
import { Box, Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'

export function RobotObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const bodyColor = object.state?.bodyColor || '#808080'
  const eyeColor = object.state?.eyeColor || '#FF0000'
  const jointColor = object.state?.jointColor || '#444444'
  
  return (
    <group>
      {/* Body */}
      <Box args={[0.8, 1, 0.5]} position={[0, 1, 0]}>
        <meshStandardMaterial 
          color={bodyColor}
          metalness={0.7}
          roughness={0.3}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
        />
      </Box>
      
      {/* Chest panel */}
      <Box args={[0.6, 0.6, 0.05]} position={[0, 1, 0.26]}>
        <meshStandardMaterial color="#222222" metalness={0.5} />
      </Box>
      
      {/* Head */}
      <Box args={[0.6, 0.5, 0.4]} position={[0, 1.75, 0]}>
        <meshStandardMaterial color={bodyColor} metalness={0.7} />
      </Box>
      
      {/* Eyes */}
      <mesh position={[-0.15, 1.8, 0.21]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={eyeColor}
          emissive={eyeColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0.15, 1.8, 0.21]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={eyeColor}
          emissive={eyeColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Antenna */}
      <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 2.15, 0]}>
        <meshStandardMaterial color={jointColor} metalness={0.8} />
      </Cylinder>
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.3} />
      </mesh>
      
      {/* Arms */}
      {/* Left arm */}
      <Cylinder args={[0.08, 0.08, 0.3]} position={[-0.5, 1.3, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color={jointColor} />
      </Cylinder>
      <Box args={[0.15, 0.4, 0.15]} position={[-0.65, 0.9, 0]}>
        <meshStandardMaterial color={bodyColor} metalness={0.7} />
      </Box>
      <Box args={[0.2, 0.15, 0.2]} position={[-0.65, 0.6, 0]}>
        <meshStandardMaterial color={jointColor} />
      </Box>
      
      {/* Right arm */}
      <Cylinder args={[0.08, 0.08, 0.3]} position={[0.5, 1.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color={jointColor} />
      </Cylinder>
      <Box args={[0.15, 0.4, 0.15]} position={[0.65, 0.9, 0]}>
        <meshStandardMaterial color={bodyColor} metalness={0.7} />
      </Box>
      <Box args={[0.2, 0.15, 0.2]} position={[0.65, 0.6, 0]}>
        <meshStandardMaterial color={jointColor} />
      </Box>
      
      {/* Legs */}
      {/* Left leg */}
      <Cylinder args={[0.1, 0.1, 0.15]} position={[-0.25, 0.425, 0]}>
        <meshStandardMaterial color={jointColor} />
      </Cylinder>
      <Box args={[0.2, 0.5, 0.2]} position={[-0.25, 0.05, 0]}>
        <meshStandardMaterial color={bodyColor} metalness={0.7} />
      </Box>
      <Box args={[0.3, 0.1, 0.4]} position={[-0.25, -0.25, 0]}>
        <meshStandardMaterial color={jointColor} />
      </Box>
      
      {/* Right leg */}
      <Cylinder args={[0.1, 0.1, 0.15]} position={[0.25, 0.425, 0]}>
        <meshStandardMaterial color={jointColor} />
      </Cylinder>
      <Box args={[0.2, 0.5, 0.2]} position={[0.25, 0.05, 0]}>
        <meshStandardMaterial color={bodyColor} metalness={0.7} />
      </Box>
      <Box args={[0.3, 0.1, 0.4]} position={[0.25, -0.25, 0]}>
        <meshStandardMaterial color={jointColor} />
      </Box>
      
      {isSelected && (
        <Box args={[1.5, 2.5, 1]} position={[0, 1, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const robotSchema = new PropertyBuilder()
  .addGroup({
    id: 'appearance',
    label: '외관',
    icon: '🤖',
    properties: [
      {
        key: 'bodyColor',
        type: PropertyType.COLOR,
        label: '몸체 색상',
        defaultValue: '#808080'
      },
      {
        key: 'eyeColor',
        type: PropertyType.COLOR,
        label: '눈 색상',
        defaultValue: '#FF0000'
      },
      {
        key: 'jointColor',
        type: PropertyType.COLOR,
        label: '관절 색상',
        defaultValue: '#444444'
      }
    ]
  })
  .inherit('transform')
  .build()

export const RobotDefinition = {
  metadata: {
    type: 'scifi_robot',
    name: '로봇',
    category: 'scifi' as ObjectCategory,
    icon: '🤖',
    description: '친근한 서비스 로봇',
    tags: ['scifi', 'robot', 'android', 'tech']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 2,
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
  component: RobotObject,
  propertySchema: robotSchema
}