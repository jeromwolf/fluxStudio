import React from 'react'
import { Ring, Box } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'
import * as THREE from 'three'

export function PortalObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const portalColor = object.state?.portalColor || '#00FFFF'
  const frameColor = object.state?.frameColor || '#444444'
  const glowIntensity = object.state?.glowIntensity || 0.5
  
  return (
    <group>
      {/* Portal frame */}
      <Ring args={[1.8, 2, 8, 1]} rotation={[0, 0, 0]}>
        <meshStandardMaterial 
          color={frameColor}
          metalness={0.9}
          roughness={0.1}
        />
      </Ring>
      
      {/* Inner ring glow */}
      <Ring args={[1.5, 1.8, 8, 1]} rotation={[0, 0, 0]}>
        <meshStandardMaterial 
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={glowIntensity}
        />
      </Ring>
      
      {/* Portal surface */}
      <mesh rotation={[0, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial 
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={glowIntensity * 0.3}
          opacity={isPreview ? 0.5 : 0.7}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Energy particles (simplified) */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 1.2
        const y = Math.sin(rad) * 1.2
        
        return (
          <mesh key={`particle-${i}`} position={[x, y, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={portalColor}
              emissive={portalColor}
              emissiveIntensity={1}
            />
          </mesh>
        )
      })}
      
      {/* Base platform */}
      <Box args={[3, 0.2, 3]} position={[0, -2, 0]}>
        <meshStandardMaterial 
          color={frameColor}
          metalness={0.7}
          roughness={0.3}
        />
      </Box>
      
      {/* Tech details on platform */}
      <Box args={[0.3, 0.1, 0.3]} position={[-0.8, -1.85, -0.8]}>
        <meshStandardMaterial color={portalColor} emissive={portalColor} emissiveIntensity={0.3} />
      </Box>
      <Box args={[0.3, 0.1, 0.3]} position={[0.8, -1.85, -0.8]}>
        <meshStandardMaterial color={portalColor} emissive={portalColor} emissiveIntensity={0.3} />
      </Box>
      <Box args={[0.3, 0.1, 0.3]} position={[-0.8, -1.85, 0.8]}>
        <meshStandardMaterial color={portalColor} emissive={portalColor} emissiveIntensity={0.3} />
      </Box>
      <Box args={[0.3, 0.1, 0.3]} position={[0.8, -1.85, 0.8]}>
        <meshStandardMaterial color={portalColor} emissive={portalColor} emissiveIntensity={0.3} />
      </Box>
      
      {isSelected && (
        <Box args={[4, 4.5, 4]} position={[0, 0.25, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const portalSchema = new PropertyBuilder()
  .addGroup({
    id: 'appearance',
    label: '외관',
    icon: '🌀',
    properties: [
      {
        key: 'portalColor',
        type: PropertyType.COLOR,
        label: '포털 색상',
        defaultValue: '#00FFFF'
      },
      {
        key: 'frameColor',
        type: PropertyType.COLOR,
        label: '프레임 색상',
        defaultValue: '#444444'
      },
      {
        key: 'glowIntensity',
        type: PropertyType.RANGE,
        label: '발광 강도',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.5
      }
    ]
  })
  .inherit('transform')
  .build()

export const PortalDefinition = {
  metadata: {
    type: 'scifi_portal',
    name: '포털',
    category: 'scifi' as ObjectCategory,
    icon: '🌀',
    description: '차원 이동 포털',
    tags: ['scifi', 'portal', 'teleport', 'gateway']
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
        color: '#00FFFF'
      }
    }
  },
  component: PortalObject,
  propertySchema: portalSchema
}