import React from 'react'
import { Box, Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../../object-system/types'
import { PropertyBuilder, PropertyType, ColorProperty, BooleanProperty } from '../../../object-system/property-system'

export function GamingChairObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const primaryColor = object.state?.primaryColor || '#FF0000'
  const secondaryColor = object.state?.secondaryColor || '#000000'
  const hasRGB = object.state?.hasRGB !== false
  const seatHeight = 0.55
  
  return (
    <group>
      {/* Seat - Racing style */}
      <group position={[0, seatHeight, 0]}>
        {/* Main seat */}
        <Box args={[0.5, 0.12, 0.5]}>
          <meshStandardMaterial
            color={primaryColor}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
            roughness={0.4}
            metalness={0}
          />
        </Box>
        {/* Side bolsters */}
        <Box args={[0.08, 0.2, 0.4]} position={[-0.29, 0.1, 0]}>
          <meshStandardMaterial color={secondaryColor} roughness={0.4} />
        </Box>
        <Box args={[0.08, 0.2, 0.4]} position={[0.29, 0.1, 0]}>
          <meshStandardMaterial color={secondaryColor} roughness={0.4} />
        </Box>
      </group>
      
      {/* Backrest - High back racing style */}
      <group position={[0, seatHeight + 0.5, -0.2]}>
        {/* Main back */}
        <Box args={[0.5, 0.8, 0.1]}>
          <meshStandardMaterial
            color={primaryColor}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
            roughness={0.4}
          />
        </Box>
        {/* Side wings */}
        <Box args={[0.08, 0.6, 0.08]} position={[-0.29, 0.1, 0]}>
          <meshStandardMaterial color={secondaryColor} roughness={0.4} />
        </Box>
        <Box args={[0.08, 0.6, 0.08]} position={[0.29, 0.1, 0]}>
          <meshStandardMaterial color={secondaryColor} roughness={0.4} />
        </Box>
        {/* Headrest */}
        <Box args={[0.3, 0.15, 0.08]} position={[0, 0.325, 0.02]}>
          <meshStandardMaterial color={secondaryColor} roughness={0.3} />
        </Box>
      </group>
      
      {/* Armrests - 4D adjustable style */}
      <Box
        args={[0.08, 0.03, 0.25]}
        position={[-0.3, seatHeight + 0.25, 0.05]}
      >
        <meshStandardMaterial color={secondaryColor} roughness={0.3} metalness={0.5} />
      </Box>
      <Box
        args={[0.08, 0.03, 0.25]}
        position={[0.3, seatHeight + 0.25, 0.05]}
      >
        <meshStandardMaterial color={secondaryColor} roughness={0.3} metalness={0.5} />
      </Box>
      
      {/* Support posts for armrests */}
      <Cylinder
        args={[0.02, 0.02, 0.2]}
        position={[-0.3, seatHeight + 0.15, 0.05]}
      >
        <meshStandardMaterial color="#4A4A4A" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder
        args={[0.02, 0.02, 0.2]}
        position={[0.3, seatHeight + 0.15, 0.05]}
      >
        <meshStandardMaterial color="#4A4A4A" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Gas cylinder */}
      <Cylinder
        args={[0.04, 0.04, seatHeight - 0.1]}
        position={[0, (seatHeight - 0.1) / 2, 0]}
      >
        <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.1} />
      </Cylinder>
      
      {/* 5-star base */}
      <group position={[0, 0.05, 0]}>
        {/* Center hub */}
        <Cylinder args={[0.08, 0.08, 0.1]}>
          <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.1} />
        </Cylinder>
        {/* 5 arms */}
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          return (
            <Box
              key={i}
              args={[0.05, 0.03, 0.35]}
              position={[Math.cos(rad) * 0.175, 0, Math.sin(rad) * 0.175]}
              rotation={[0, -rad, 0]}
            >
              <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.1} />
            </Box>
          )
        })}
      </group>
      
      {/* Caster wheels */}
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <Cylinder
            key={i}
            args={[0.04, 0.04, 0.03]}
            position={[Math.cos(rad) * 0.35, 0.05, Math.sin(rad) * 0.35]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
          </Cylinder>
        )
      })}
      
      {/* RGB lighting effect (visual only) */}
      {hasRGB && (
        <>
          <Box args={[0.02, 0.6, 0.02]} position={[-0.26, seatHeight + 0.5, -0.25]}>
            <meshBasicMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
          </Box>
          <Box args={[0.02, 0.6, 0.02]} position={[0.26, seatHeight + 0.5, -0.25]}>
            <meshBasicMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
          </Box>
        </>
      )}
      
      {/* Selection outline */}
      {isSelected && (
        <Box args={[0.7, 1.5, 0.7]} position={[0, 0.75, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

// Property schema for gaming chair
export const gamingChairSchema = new PropertyBuilder()
  .addGroup({
    id: 'colors',
    label: 'Colors',
    icon: '🎨',
    properties: [
      {
        key: 'primaryColor',
        type: PropertyType.COLOR,
        label: 'Primary Color',
        defaultValue: '#FF0000'
      } as ColorProperty,
      {
        key: 'secondaryColor',
        type: PropertyType.COLOR,
        label: 'Secondary Color',
        defaultValue: '#000000'
      } as ColorProperty
    ]
  })
  .addGroup({
    id: 'features',
    label: 'Features',
    icon: '💡',
    properties: [
      {
        key: 'hasRGB',
        type: PropertyType.BOOLEAN,
        label: 'RGB Lighting',
        defaultValue: true
      } as BooleanProperty
    ]
  })
  .inherit('transform')
  .build()

// Gaming Chair definition
export const GamingChairDefinition = {
  metadata: {
    type: 'furniture_chair_gaming',
    name: 'Gaming Chair',
    category: ObjectCategory.FURNITURE,
    icon: '🎮',
    description: 'A high-back racing-style gaming chair',
    tags: ['furniture', 'chair', 'gaming', 'seating', 'office', 'esports']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.9,
      maxScale: 1.2,
      snapToGrid: true,
      gridSize: 0.1
    },
    interactions: {
      clickable: true,
      hoverable: true,
      draggable: true,
      selectable: true,
      sittable: true,
      rotatable: true
    },
    materials: {
      default: {
        type: 'standard' as const,
        color: '#FF0000',
        roughness: 0.4,
        metalness: 0
      }
    }
  },
  component: GamingChairObject,
  propertySchema: gamingChairSchema
}