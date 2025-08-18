import React from 'react'
import { Box } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'

export function CubeObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const material = object.config.materials?.default || { color: '#808080' }
  
  return (
    <Box
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
      <meshStandardMaterial
        color={material.color}
        opacity={isPreview ? 0.7 : (material.opacity || 1)}
        transparent={isPreview || material.transparent}
        wireframe={isSelected}
      />
    </Box>
  )
}

// Property schema for cube
export const cubeSchema = new PropertyBuilder()
  .addGroup({
    id: 'dimensions',
    label: 'Dimensions',
    icon: '📏',
    properties: [
      {
        key: 'width',
        type: PropertyType.NUMBER,
        label: 'Width',
        defaultValue: 1,
        min: 0.1,
        max: 10,
        step: 0.1
      },
      {
        key: 'height',
        type: PropertyType.NUMBER,
        label: 'Height',
        defaultValue: 1,
        min: 0.1,
        max: 10,
        step: 0.1
      },
      {
        key: 'depth',
        type: PropertyType.NUMBER,
        label: 'Depth',
        defaultValue: 1,
        min: 0.1,
        max: 10,
        step: 0.1
      }
    ]
  })
  .addGroup({
    id: 'segments',
    label: 'Segments',
    icon: '🔲',
    collapsible: true,
    defaultExpanded: false,
    properties: [
      {
        key: 'widthSegments',
        type: PropertyType.NUMBER,
        label: 'Width Segments',
        defaultValue: 1,
        min: 1,
        max: 10
      },
      {
        key: 'heightSegments',
        type: PropertyType.NUMBER,
        label: 'Height Segments',
        defaultValue: 1,
        min: 1,
        max: 10
      },
      {
        key: 'depthSegments',
        type: PropertyType.NUMBER,
        label: 'Depth Segments',
        defaultValue: 1,
        min: 1,
        max: 10
      }
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()

// Cube definition
export const CubeDefinition = {
  metadata: {
    type: 'cube',
    name: 'Cube',
    category: ObjectCategory.BASIC,
    icon: '🟦',
    description: 'A basic cube shape',
    tags: ['basic', 'primitive', 'box']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.1,
      maxScale: 10,
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
        color: '#808080',
        metalness: 0.3,
        roughness: 0.7
      },
      allowColorChange: true
    }
  },
  component: CubeObject
}