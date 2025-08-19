import React from 'react'
import { Box, Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder } from '../../object-system/property-system'

export function BumperCarsObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const carColors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00']
  
  return (
    <group>
      {/* Arena Floor */}
      <Cylinder args={[3, 3, 0.1]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#333333" metalness={0.3} />
      </Cylinder>
      
      {/* Arena Border */}
      <Cylinder args={[3.2, 3.2, 0.5, 32, 1, true]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#FF0000" />
      </Cylinder>
      <Cylinder args={[3, 3, 0.5, 32, 1, true]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      
      {/* Bumper Cars */}
      {carColors.map((color, i) => {
        const angle = (i / carColors.length) * Math.PI * 2
        const x = Math.cos(angle) * 1.5
        const z = Math.sin(angle) * 1.5
        
        return (
          <group key={`car-${i}`} position={[x, 0.3, z]} rotation={[0, angle, 0]}>
            {/* Car Body */}
            <Cylinder args={[0.4, 0.35, 0.3, 16]}>
              <meshStandardMaterial 
                color={color}
                opacity={isPreview ? 0.7 : 1}
                transparent={isPreview}
              />
            </Cylinder>
            {/* Bumper */}
            <Cylinder args={[0.45, 0.45, 0.1, 16]} position={[0, -0.1, 0]}>
              <meshStandardMaterial color="#000000" />
            </Cylinder>
            {/* Pole */}
            <Cylinder args={[0.02, 0.02, 0.8]} position={[0, 0.5, 0]}>
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </Cylinder>
          </group>
        )
      })}
      
      {/* Ceiling Grid (simplified) */}
      <Box args={[6, 0.05, 0.05]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.7} />
      </Box>
      <Box args={[0.05, 0.05, 6]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.7} />
      </Box>
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[6.5, 2.5, 6.5]} position={[0, 1.25, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const bumperCarsSchema = new PropertyBuilder()
  .inherit('transform')
  .build()

export const BumperCarsDefinition = {
  metadata: {
    type: 'amusement_bumper_cars',
    name: 'Bumper Cars',
    category: 'amusement' as ObjectCategory,
    icon: '🚗',
    description: 'Electric bumper cars arena',
    tags: ['amusement', 'ride', 'bumper-cars', 'fun']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 2,
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
        color: '#333333'
      }
    }
  },
  component: BumperCarsObject,
  propertySchema: bumperCarsSchema
}