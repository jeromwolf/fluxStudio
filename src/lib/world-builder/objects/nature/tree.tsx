import React from 'react'
import { Cone, Cylinder } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType, SelectProperty } from '../../object-system/property-system'

export function TreeObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const treeType = object.state?.treeType || 'pine'
  const leafColor = object.state?.leafColor || '#228B22'
  const trunkColor = object.state?.trunkColor || '#8B4513'
  
  if (treeType === 'pine') {
    return (
      <group>
        {/* Trunk */}
        <Cylinder args={[0.3, 0.4, 2]} position={[0, 1, 0]}>
          <meshStandardMaterial 
            color={trunkColor}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
            roughness={0.8}
          />
        </Cylinder>
        
        {/* Tree layers */}
        <Cone args={[1.5, 2, 8]} position={[0, 3, 0]}>
          <meshStandardMaterial 
            color={leafColor}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
          />
        </Cone>
        <Cone args={[1.2, 1.5, 8]} position={[0, 4, 0]}>
          <meshStandardMaterial color={leafColor} />
        </Cone>
        <Cone args={[0.8, 1, 8]} position={[0, 4.8, 0]}>
          <meshStandardMaterial color={leafColor} />
        </Cone>
        
        {isSelected && (
          <Cone args={[2, 6, 8]} position={[0, 3, 0]}>
            <meshBasicMaterial color="#00ff00" wireframe />
          </Cone>
        )}
      </group>
    )
  } else {
    // Oak tree
    return (
      <group>
        {/* Trunk */}
        <Cylinder args={[0.4, 0.5, 3]} position={[0, 1.5, 0]}>
          <meshStandardMaterial 
            color={trunkColor}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
            roughness={0.8}
          />
        </Cylinder>
        
        {/* Leaves (spherical) */}
        <mesh position={[0, 4.5, 0]}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshStandardMaterial 
            color={leafColor}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
            roughness={0.9}
          />
        </mesh>
        
        {isSelected && (
          <mesh position={[0, 3, 0]}>
            <sphereGeometry args={[3, 16, 16]} />
            <meshBasicMaterial color="#00ff00" wireframe />
          </mesh>
        )}
      </group>
    )
  }
}

export const treeSchema = new PropertyBuilder()
  .addGroup({
    id: 'type',
    label: 'Tree Type',
    icon: '🌳',
    properties: [
      {
        key: 'treeType',
        type: PropertyType.SELECT,
        label: 'Type',
        options: [
          { value: 'pine', label: 'Pine Tree' },
          { value: 'oak', label: 'Oak Tree' }
        ],
        defaultValue: 'pine'
      } as SelectProperty,
      {
        key: 'leafColor',
        type: PropertyType.COLOR,
        label: 'Leaf Color',
        defaultValue: '#228B22'
      },
      {
        key: 'trunkColor',
        type: PropertyType.COLOR,
        label: 'Trunk Color',
        defaultValue: '#8B4513'
      }
    ]
  })
  .inherit('transform')
  .build()

export const TreeDefinition = {
  metadata: {
    type: 'nature_tree',
    name: 'Tree',
    category: 'nature' as ObjectCategory,
    icon: '🌳',
    description: 'A beautiful tree',
    tags: ['nature', 'tree', 'forest', 'green']
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
        color: '#228B22'
      }
    }
  },
  component: TreeObject,
  propertySchema: treeSchema
}