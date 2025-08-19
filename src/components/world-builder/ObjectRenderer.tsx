import React from 'react'
import { ObjectRegistry } from '@/lib/world-builder/object-system/registry'
import { PlacedObject } from './WorldBuilder'

interface ObjectRendererProps {
  placedObject: PlacedObject
  isSelected: boolean
}

export function ObjectRenderer({ placedObject, isSelected }: ObjectRendererProps) {
  const registry = ObjectRegistry.getInstance()
  const definition = registry.get(placedObject.type)
  
  if (!definition || !definition.component) {
    // Fallback to mesh if no component
    return <primitive object={placedObject.mesh} />
  }
  
  const Component = definition.component
  const objectData = {
    id: placedObject.id,
    type: placedObject.type,
    state: placedObject.customProperties || {},
    metadata: definition.metadata,
    position: placedObject.position,
    rotation: placedObject.rotation,
    scale: placedObject.scale
  }
  
  return (
    <group 
      position={[placedObject.position.x, placedObject.position.y, placedObject.position.z]}
      rotation={[placedObject.rotation.x, placedObject.rotation.y, placedObject.rotation.z]}
      scale={[placedObject.scale.x, placedObject.scale.y, placedObject.scale.z]}
    >
      <Component 
        object={objectData}
        isPreview={false}
        isSelected={isSelected}
      />
    </group>
  )
}