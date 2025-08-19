import React from 'react'
import { Box, Cylinder, Cone } from '@react-three/drei'
import { ObjectComponentProps, ObjectCategory } from '../../object-system/types'
import { PropertyBuilder, PropertyType } from '../../object-system/property-system'

export function CastleObject({ object, isPreview, isSelected }: ObjectComponentProps) {
  const wallColor = object.state?.wallColor || '#8B7355'
  const roofColor = object.state?.roofColor || '#8B4513'
  const flagColor = object.state?.flagColor || '#FF0000'
  
  return (
    <group>
      {/* Main keep */}
      <Box args={[2, 2.5, 2]} position={[0, 1.25, 0]}>
        <meshStandardMaterial 
          color={wallColor}
          opacity={isPreview ? 0.7 : 1}
          transparent={isPreview}
          roughness={0.9}
        />
      </Box>
      
      {/* Keep windows */}
      {[[-0.5, 1.8, 1.01], [0.5, 1.8, 1.01], [-0.5, 0.8, 1.01], [0.5, 0.8, 1.01]].map((pos, i) => (
        <Box key={`window-${i}`} args={[0.3, 0.4, 0.1]} position={pos as [number, number, number]}>
          <meshStandardMaterial color="#000000" />
        </Box>
      ))}
      
      {/* Corner towers */}
      {[[-1.2, 0, -1.2], [1.2, 0, -1.2], [-1.2, 0, 1.2], [1.2, 0, 1.2]].map((pos, i) => (
        <group key={`tower-${i}`} position={pos as [number, number, number]}>
          <Cylinder args={[0.4, 0.4, 3]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color={wallColor} roughness={0.9} />
          </Cylinder>
          <Cone args={[0.5, 0.8, 6]} position={[0, 3.4, 0]}>
            <meshStandardMaterial color={roofColor} />
          </Cone>
          {/* Tower flag */}
          <Cylinder args={[0.02, 0.02, 0.5]} position={[0, 4, 0]}>
            <meshStandardMaterial color="#444444" />
          </Cylinder>
          <Box args={[0.2, 0.15, 0.02]} position={[0.1, 4.15, 0]}>
            <meshStandardMaterial color={flagColor} />
          </Box>
        </group>
      ))}
      
      {/* Gate */}
      <Box args={[0.8, 1.2, 0.3]} position={[0, 0.6, 1.1]}>
        <meshStandardMaterial color="#4B3621" />
      </Box>
      
      {/* Gate arch */}
      <mesh position={[0, 1.2, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#4B3621" />
      </mesh>
      
      {/* Walls */}
      <Box args={[1, 1.5, 0.2]} position={[-1.5, 0.75, 0]}>
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </Box>
      <Box args={[1, 1.5, 0.2]} position={[1.5, 0.75, 0]}>
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </Box>
      
      {/* Crenellations */}
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <Box key={`crenel-${i}`} args={[0.2, 0.3, 0.2]} position={[x, 2.65, 0]}>
          <meshStandardMaterial color={wallColor} />
        </Box>
      ))}
      
      {isSelected && (
        <Box args={[4, 4, 4]} position={[0, 2, 0]}>
          <meshBasicMaterial color="#00ff00" wireframe />
        </Box>
      )}
    </group>
  )
}

export const castleSchema = new PropertyBuilder()
  .addGroup({
    id: 'appearance',
    label: '외관',
    icon: '🏰',
    properties: [
      {
        key: 'wallColor',
        type: PropertyType.COLOR,
        label: '성벽 색상',
        defaultValue: '#8B7355'
      },
      {
        key: 'roofColor',
        type: PropertyType.COLOR,
        label: '지붕 색상',
        defaultValue: '#8B4513'
      },
      {
        key: 'flagColor',
        type: PropertyType.COLOR,
        label: '깃발 색상',
        defaultValue: '#FF0000'
      }
    ]
  })
  .inherit('transform')
  .build()

export const CastleDefinition = {
  metadata: {
    type: 'fantasy_castle',
    name: '성',
    category: 'fantasy' as ObjectCategory,
    icon: '🏰',
    description: '중세 판타지 성',
    tags: ['fantasy', 'castle', 'medieval', 'fortress']
  },
  config: {
    defaultProperties: {
      scale: { x: 1, y: 1, z: 1 }
    },
    constraints: {
      minScale: 0.5,
      maxScale: 3,
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
        color: '#8B7355'
      }
    }
  },
  component: CastleObject,
  propertySchema: castleSchema
}