import React from 'react'
import { Box, Cylinder } from '@react-three/drei'
import * as THREE from 'three'
import { ObjectPlugin, ObjectComponentProps, ObjectCategory } from '../object-system/types'
import { PropertyBuilder, PropertyType, EnumProperty, ColorProperty } from '../object-system/property-system'

// Chair Component
function ChairObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#8B4513' }
  const style = object.state?.style || 'modern'
  
  return (
    <group
      position={[
        object.properties.position.x,
        object.properties.position.y,
        object.properties.position.z
      ]}
      rotation={[
        object.properties.rotation.x,
        object.properties.rotation.y,
        object.properties.rotation.z
      ]}
      scale={[
        object.properties.scale.x,
        object.properties.scale.y,
        object.properties.scale.z
      ]}
    >
      {/* Seat */}
      <Box args={[0.5, 0.05, 0.5]} position={[0, 0.4, 0]}>
        <meshStandardMaterial
          color={material.color}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
        />
      </Box>
      
      {/* Back */}
      <Box args={[0.5, 0.5, 0.05]} position={[0, 0.65, -0.225]}>
        <meshStandardMaterial
          color={material.color}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
        />
      </Box>
      
      {/* Legs */}
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map((pos, i) => (
        <Cylinder
          key={i}
          args={[0.02, 0.02, 0.4]}
          position={[pos[0], 0.2, pos[1]]}
        >
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
          />
        </Cylinder>
      ))}
    </group>
  )
}

// Table Component
function TableObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#654321' }
  const shape = object.state?.shape || 'rectangle'
  
  return (
    <group
      position={[
        object.properties.position.x,
        object.properties.position.y,
        object.properties.position.z
      ]}
      rotation={[
        object.properties.rotation.x,
        object.properties.rotation.y,
        object.properties.rotation.z
      ]}
      scale={[
        object.properties.scale.x,
        object.properties.scale.y,
        object.properties.scale.z
      ]}
    >
      {/* Table top */}
      {shape === 'rectangle' ? (
        <Box args={[1.2, 0.05, 0.8]} position={[0, 0.75, 0]}>
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
          />
        </Box>
      ) : (
        <Cylinder args={[0.6, 0.6, 0.05, 32]} position={[0, 0.75, 0]}>
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
          />
        </Cylinder>
      )}
      
      {/* Legs */}
      {shape === 'rectangle' ? (
        // Rectangle table legs
        [[-0.5, -0.35], [0.5, -0.35], [-0.5, 0.35], [0.5, 0.35]].map((pos, i) => (
          <Box
            key={i}
            args={[0.05, 0.75, 0.05]}
            position={[pos[0], 0.375, pos[1]]}
          >
            <meshStandardMaterial
              color={material.color}
              opacity={isPreview ? 0.7 : 1}
              transparent={isPreview}
            />
          </Box>
        ))
      ) : (
        // Round table single leg
        <Cylinder args={[0.15, 0.15, 0.75]} position={[0, 0.375, 0]}>
          <meshStandardMaterial
            color={material.color}
            opacity={isPreview ? 0.7 : 1}
            transparent={isPreview}
          />
        </Cylinder>
      )}
    </group>
  )
}

// Property schemas
const chairSchema = new PropertyBuilder()
  .addGroup({
    id: 'style',
    label: 'Style',
    icon: '🪑',
    properties: [
      {
        key: 'style',
        type: PropertyType.ENUM,
        label: 'Chair Style',
        defaultValue: 'modern',
        options: [
          { value: 'modern', label: 'Modern', icon: '🔲' },
          { value: 'classic', label: 'Classic', icon: '👑' },
          { value: 'office', label: 'Office', icon: '💼' },
          { value: 'dining', label: 'Dining', icon: '🍽️' }
        ]
      } as EnumProperty,
      {
        key: 'material',
        type: PropertyType.ENUM,
        label: 'Material',
        defaultValue: 'wood',
        options: [
          { value: 'wood', label: 'Wood' },
          { value: 'metal', label: 'Metal' },
          { value: 'plastic', label: 'Plastic' },
          { value: 'fabric', label: 'Fabric' }
        ]
      } as EnumProperty
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

const tableSchema = new PropertyBuilder()
  .addGroup({
    id: 'design',
    label: 'Design',
    icon: '🪵',
    properties: [
      {
        key: 'shape',
        type: PropertyType.ENUM,
        label: 'Shape',
        defaultValue: 'rectangle',
        options: [
          { value: 'rectangle', label: 'Rectangle', icon: '▭' },
          { value: 'round', label: 'Round', icon: '⭕' }
        ]
      } as EnumProperty,
      {
        key: 'woodType',
        type: PropertyType.COLOR,
        label: 'Wood Color',
        defaultValue: '#654321',
        presets: ['#654321', '#8B4513', '#A0522D', '#DEB887']
      } as ColorProperty
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Furniture Plugin Definition
export const furniturePlugin: ObjectPlugin = {
  name: 'furniture-essentials',
  version: '1.0.0',
  
  initialize: async () => {
    console.log('Furniture Plugin loaded!')
  },
  
  objects: [
    {
      metadata: {
        type: 'furniture_chair',
        name: 'Chair',
        category: ObjectCategory.FURNITURE,
        icon: '🪑',
        description: 'A comfortable chair',
        tags: ['furniture', 'seating', 'chair']
      },
      config: {
        defaultProperties: {
          position: new THREE.Vector3(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        },
        constraints: {
          minScale: 0.5,
          maxScale: 2,
          snapToGrid: true,
          gridSize: 0.25,
          placementRules: [
            { type: 'ground', offset: 0 }
          ]
        },
        interactions: {
          clickable: true,
          hoverable: true,
          draggable: true,
          selectable: true,
          customActions: [
            {
              id: 'sit',
              name: 'Sit',
              icon: '🧘',
              handler: (object) => {
                console.log('Sitting on chair:', object.id)
              }
            }
          ]
        },
        materials: {
          default: {
            type: 'standard',
            color: '#8B4513',
            roughness: 0.8,
            metalness: 0.1
          },
          allowColorChange: true
        }
      },
      component: ChairObject
    },
    {
      metadata: {
        type: 'furniture_table',
        name: 'Table',
        category: ObjectCategory.FURNITURE,
        icon: '🪵',
        description: 'A sturdy table',
        tags: ['furniture', 'table', 'surface']
      },
      config: {
        defaultProperties: {
          position: new THREE.Vector3(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        },
        constraints: {
          minScale: 0.5,
          maxScale: 3,
          snapToGrid: true,
          gridSize: 0.25,
          placementRules: [
            { type: 'ground', offset: 0 }
          ]
        },
        interactions: {
          clickable: true,
          hoverable: true,
          draggable: true,
          selectable: true
        },
        materials: {
          default: {
            type: 'standard',
            color: '#654321',
            roughness: 0.7,
            metalness: 0.1
          },
          variants: {
            glass: {
              type: 'physical',
              color: '#ffffff',
              metalness: 0,
              roughness: 0,
              opacity: 0.3,
              transparent: true
            },
            metal: {
              type: 'standard',
              color: '#C0C0C0',
              metalness: 0.9,
              roughness: 0.3
            }
          },
          allowColorChange: true
        }
      },
      component: TableObject
    }
  ]
}