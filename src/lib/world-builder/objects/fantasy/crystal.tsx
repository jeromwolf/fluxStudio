import React from 'react'
import { Cylinder, Box } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, SelectProperty } from '../../object-system/property-system'

export function CrystalObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const crystalType = object.state?.crystalType || 'single'
  const crystalColor = object.state?.crystalColor || '#00CED1'
  const baseColor = object.state?.baseColor || '#2F4F4F'
  
  const renderCrystal = (position: [number, number, number], scale: number = 1, rotation: [number, number, number] = [0, 0, 0]) => (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Crystal shaft */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.1, 1.5, 6]} />
        <meshStandardMaterial 
          color={crystalColor}
          emissive={crystalColor}
          emissiveIntensity={0.2}
          metalness={0.3}
          roughness={0.1}
          opacity={isPreview ? 0.6 : 0.8}
          transparent
        />
      </mesh>
      
      {/* Crystal tip */}
      <mesh position={[0, 0.75, 0]}>
        <coneGeometry args={[0.3, 0.5, 6]} />
        <meshStandardMaterial 
          color={crystalColor}
          emissive={crystalColor}
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.1}
          opacity={isPreview ? 0.6 : 0.8}
          transparent
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.05, 1.3, 6]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.5}
          opacity={0.3}
          transparent
        />
      </mesh>
    </group>
  )
  
  return (
    <group>
      {/* Base rock */}
      <mesh position={[0, -0.2, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial 
          color={baseColor}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {crystalType === 'single' ? (
        renderCrystal([0, 0.5, 0])
      ) : crystalType === 'cluster' ? (
        <>
          {renderCrystal([0, 0.5, 0], 1.2)}
          {renderCrystal([-0.3, 0.3, 0.2], 0.8, [0, 0, -0.3])}
          {renderCrystal([0.25, 0.3, -0.15], 0.7, [0, 0, 0.4])}
          {renderCrystal([0.1, 0.2, 0.3], 0.6, [0.2, 0, -0.2])}
        </>
      ) : (
        // floating
        <>
          {/* Floating crystal */}
          <group position={[0, 1.5, 0]}>
            {renderCrystal([0, 0, 0], 1.3)}
            
            {/* Rotation ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.8, 0.05, 8, 32]} />
              <meshStandardMaterial 
                color={crystalColor}
                emissive={crystalColor}
                emissiveIntensity={0.4}
                opacity={0.6}
                transparent
              />
            </mesh>
          </group>
          
          {/* Energy beam */}
          <Cylinder args={[0.1, 0.3, 1]} position={[0, 0.5, 0]}>
            <meshStandardMaterial 
              color={crystalColor}
              emissive={crystalColor}
              emissiveIntensity={0.8}
              opacity={0.3}
              transparent
            />
          </Cylinder>
        </>
      )}
      
      {/* Ambient particles */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 0.5
        const z = Math.sin(rad) * 0.5
        const y = 0.8 + Math.sin(Date.now() * 0.001 + i) * 0.2
        
        return (
          <mesh key={`particle-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial 
              color={crystalColor}
              emissive={crystalColor}
              emissiveIntensity={1}
            />
          </mesh>
        )
      })}
      
      {isSelected && (
        <Box args={[2, 3, 2]} position={[0, 1.5, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const crystalSchema = new PropertyBuilder()
  .addGroup({
    id: 'crystal',
    label: '크리스탈 속성',
    icon: '💎',
    properties: [
      {
        key: 'crystalType',
        type: PropertyType.SELECT,
        label: '타입',
        options: [
          { value: 'single', label: '단일 크리스탈' },
          { value: 'cluster', label: '크리스탈 무리' },
          { value: 'floating', label: '부유 크리스탈' }
        ],
        defaultValue: 'single'
      } as SelectProperty,
      {
        key: 'crystalColor',
        type: PropertyType.COLOR,
        label: '크리스탈 색상',
        defaultValue: '#00CED1'
      },
      {
        key: 'baseColor',
        type: PropertyType.COLOR,
        label: '받침 색상',
        defaultValue: '#2F4F4F'
      }
    ]
  })
  .inherit('transform')
  .build()

export const CrystalDefinition = {
  metadata: {
    type: 'fantasy_crystal',
    name: '마법 크리스탈',
    category: 'fantasy' as ObjectCategory,
    icon: '💎',
    description: '신비한 마법 크리스탈',
    tags: ['fantasy', 'crystal', 'magic', 'gem', 'mystical']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.3,
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
        color: '#00CED1'
      }
    }
  },
  component: CrystalObject,
  propertySchema: crystalSchema
}