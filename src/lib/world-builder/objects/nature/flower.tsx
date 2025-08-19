import React from 'react'
import { Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, SelectProperty } from '../../object-system/property-system'

export function FlowerObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const flowerType = object.state?.flowerType || 'sunflower'
  const petalColor = object.state?.petalColor || '#FFD700'
  const centerColor = object.state?.centerColor || '#8B4513'
  
  if (flowerType === 'sunflower') {
    return (
      <group>
        {/* Stem */}
        <Cylinder args={[0.05, 0.05, 1.5]} position={[0, 0.75, 0]}>
          <meshStandardMaterial color="#228B22" />
        </Cylinder>
        
        {/* Leaf */}
        <mesh position={[0.1, 0.8, 0]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[0.3, 0.15]} />
          <meshStandardMaterial color="#228B22" side={2} />
        </mesh>
        
        {/* Flower petals */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const x = Math.cos(angle) * 0.25
          const z = Math.sin(angle) * 0.25
          
          return (
            <mesh key={`petal-${i}`} position={[x, 1.5, z]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.15, 0.1, 0.3]} />
              <meshStandardMaterial 
                color={petalColor}
                opacity={isPreview ? 0.7 : 1}
                transparent={isPreview}
              />
            </mesh>
          )
        })}
        
        {/* Center */}
        <Cylinder args={[0.2, 0.2, 0.1]} position={[0, 1.5, 0]}>
          <meshStandardMaterial color={centerColor} />
        </Cylinder>
        
        {isSelected && (
          <Cylinder args={[0.5, 0.5, 2]} position={[0, 1, 0]}>
            <meshBasicMaterial color="#00ff00" wireframe />
          </Cylinder>
        )}
      </group>
    )
  } else {
    // Rose
    return (
      <group>
        {/* Stem */}
        <Cylinder args={[0.04, 0.04, 1.2]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#228B22" />
        </Cylinder>
        
        {/* Thorns */}
        {[0.3, 0.7].map((y, i) => (
          <mesh key={`thorn-${i}`} position={[0.05, y, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.02, 0.05, 4]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        ))}
        
        {/* Rose bloom (layered) */}
        {[0, 0.1, 0.2].map((offset, layer) => (
          <group key={`layer-${layer}`} position={[0, 1.2 + offset, 0]}>
            {Array.from({ length: 5 + layer * 2 }).map((_, i) => {
              const count = 5 + layer * 2
              const angle = (i / count) * Math.PI * 2 + layer * 0.5
              const radius = 0.15 - layer * 0.05
              const x = Math.cos(angle) * radius
              const z = Math.sin(angle) * radius
              
              return (
                <mesh key={`petal-${i}`} position={[x, 0, z]} rotation={[0.3, angle, 0]}>
                  <sphereGeometry args={[0.08, 8, 4]} />
                  <meshStandardMaterial 
                    color={petalColor}
                    opacity={isPreview ? 0.7 : 1}
                    transparent={isPreview}
                  />
                </mesh>
              )
            })}
          </group>
        ))}
        
        {isSelected && (
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.6, 1.6, 0.6]} />
            <meshBasicMaterial color="#00ff00" wireframe />
          </mesh>
        )}
      </group>
    )
  }
}

export const flowerSchema = new PropertyBuilder()
  .addGroup({
    id: 'type',
    label: 'Flower Type',
    icon: '🌻',
    properties: [
      {
        key: 'flowerType',
        type: PropertyType.SELECT,
        label: 'Type',
        options: [
          { value: 'sunflower', label: 'Sunflower' },
          { value: 'rose', label: 'Rose' }
        ],
        defaultValue: 'sunflower'
      } as SelectProperty,
      {
        key: 'petalColor',
        type: PropertyType.COLOR,
        label: 'Petal Color',
        defaultValue: '#FFD700'
      },
      {
        key: 'centerColor',
        type: PropertyType.COLOR,
        label: 'Center Color',
        defaultValue: '#8B4513'
      }
    ]
  })
  .inherit('transform')
  .build()

export const FlowerDefinition = {
  metadata: {
    type: 'nature_flower',
    name: 'Flower',
    category: 'nature' as ObjectCategory,
    icon: '🌻',
    description: 'Beautiful flowers for your garden',
    tags: ['nature', 'flower', 'garden', 'decoration']
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
        color: '#FFD700'
      }
    }
  },
  component: FlowerObject,
  propertySchema: flowerSchema
}