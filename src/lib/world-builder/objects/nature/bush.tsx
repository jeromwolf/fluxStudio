import React from 'react'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'

export function BushObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const bushColor = object.state?.bushColor || '#228B22'
  const density = object.state?.density || 0.8
  
  return (
    <group>
      {/* Main bush body - clustered spheres */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.5, 12, 8]} />
        <meshStandardMaterial 
          color={bushColor}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
          roughness={0.9}
        />
      </mesh>
      
      {/* Additional clusters for more natural look */}
      <mesh position={[-0.3, 0.3, 0.2]}>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshStandardMaterial color={bushColor} roughness={0.9} />
      </mesh>
      
      <mesh position={[0.25, 0.35, -0.2]}>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color={bushColor} roughness={0.9} />
      </mesh>
      
      {/* Dense bush - add more spheres based on density */}
      {density > 0.5 && (
        <>
          <mesh position={[0.15, 0.25, 0.3]}>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshStandardMaterial color={bushColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.2, 0.25, -0.25]}>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshStandardMaterial color={bushColor} roughness={0.9} />
          </mesh>
        </>
      )}
      
      {/* Very dense bush */}
      {density > 0.8 && (
        <>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.25, 8, 6]} />
            <meshStandardMaterial color={bushColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.4, 0.4, 0]}>
            <sphereGeometry args={[0.2, 6, 4]} />
            <meshStandardMaterial color={bushColor} roughness={0.9} />
          </mesh>
        </>
      )}
      
      {isSelected && (
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.8, 12, 8]} />
          <meshBasicMaterial color="#00ff00" wireframe />
        </mesh>
      )}
    </group>
  )
}

export const bushSchema = new PropertyBuilder()
  .addGroup({
    id: 'appearance',
    label: 'Appearance',
    icon: '🌿',
    properties: [
      {
        key: 'bushColor',
        type: PropertyType.COLOR,
        label: 'Bush Color',
        defaultValue: '#228B22'
      },
      {
        key: 'density',
        type: PropertyType.RANGE,
        label: 'Density',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.8
      }
    ]
  })
  .inherit('transform')
  .build()

export const BushDefinition = {
  metadata: {
    type: 'nature_bush',
    name: 'Bush',
    category: 'nature' as ObjectCategory,
    icon: '🌿',
    description: 'A decorative bush',
    tags: ['nature', 'bush', 'garden', 'green']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.3,
      maxScale: 3,
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
        color: '#228B22'
      }
    }
  },
  component: BushObject,
  propertySchema: bushSchema
}