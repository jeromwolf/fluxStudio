import React from 'react'
import { Box, Cylinder, Cone } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'

export function CarouselObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const roofColor = object.state?.roofColor || '#FF1493'
  const horseCount = 6
  
  return (
    <group>
      {/* Central Pole */}
      <Cylinder args={[0.15, 0.15, 3.5]} position={[0, 1.75, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.8} />
      </Cylinder>
      
      {/* Platform */}
      <Cylinder args={[2.5, 2.5, 0.2]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      
      {/* Decorative Ring */}
      <Cylinder args={[2.3, 2.3, 0.1]} position={[0, 0.65, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.7} />
      </Cylinder>
      
      {/* Horses */}
      {Array.from({ length: horseCount }).map((_, i) => {
        const angle = (i / horseCount) * Math.PI * 2
        const x = Math.cos(angle) * 1.8
        const z = Math.sin(angle) * 1.8
        const yOffset = Math.sin(angle * 2) * 0.2
        
        return (
          <group key={`horse-${i}`} position={[x, 1.2 + yOffset, z]}>
            {/* Horse body (simplified) */}
            <Box args={[0.3, 0.4, 0.6]}>
              <meshStandardMaterial color={['#FFFFFF', '#8B4513', '#000000'][i % 3]} />
            </Box>
            {/* Pole */}
            <Cylinder args={[0.03, 0.03, 1.5]} position={[0, 0.5, 0]}>
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </Cylinder>
          </group>
        )
      })}
      
      {/* Roof */}
      <Cone args={[3, 1.5, 8]} position={[0, 3.5, 0]}>
        <meshStandardMaterial 
          color={roofColor}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
        />
      </Cone>
      
      {/* Roof decoration */}
      <Cylinder args={[0.1, 0.1, 0.5]} position={[0, 4.5, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.8} />
      </Cylinder>
      <Box args={[0.3, 0.3, 0.05]} position={[0, 4.8, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.8} />
      </Box>
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[6, 5, 6]} position={[0, 2.5, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const carouselSchema = new PropertyBuilder()
  .addGroup({
    id: 'appearance',
    label: 'Appearance',
    icon: '🎨',
    properties: [
      {
        key: 'roofColor',
        type: PropertyType.COLOR,
        label: 'Roof Color',
        defaultValue: '#FF1493'
      }
    ]
  })
  .inherit('transform')
  .build()

export const CarouselDefinition = {
  metadata: {
    type: 'amusement_carousel',
    name: 'Carousel',
    category: 'amusement' as ObjectCategory,
    icon: '🎠',
    description: 'A magical merry-go-round',
    tags: ['amusement', 'ride', 'carousel', 'merry-go-round', 'family']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 2,
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
        color: '#FF1493'
      }
    }
  },
  component: CarouselObject,
  propertySchema: carouselSchema
}