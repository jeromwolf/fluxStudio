import * as THREE from 'three'
import { ObjectRegistry } from '../object-system/registry'
import { createObjectFromDefinition } from '../object-factory'

export type ObjectType = string

export interface ObjectTemplate {
  type: ObjectType
  name: string
  icon: string
  color: string
  geometry: {
    type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'custom'
    args?: number[]
  }
}

export function getObjectTemplates(): ObjectTemplate[] {
  const registry = ObjectRegistry.getInstance()
  const allObjects = registry.getAll()
  
  return allObjects.map(def => ({
    type: def.metadata.type,
    name: def.metadata.name,
    icon: def.metadata.icon || '📦',
    color: def.config.materials?.default?.color || '#808080',
    geometry: {
      type: 'custom' as const
    }
  }))
}

export function createWorldObject(template: ObjectTemplate | string, position: THREE.Vector3): THREE.Mesh | THREE.Group {
  if (typeof template === 'string') {
    // Direct type passed, create template
    const registry = ObjectRegistry.getInstance()
    const def = registry.get(template)
    if (!def) {
      return createObjectFromDefinition(template, position)
    }
    template = {
      type: def.metadata.type,
      name: def.metadata.name,
      icon: def.metadata.icon || '📦',
      color: def.config.materials?.default?.color || '#808080',
      geometry: { type: 'custom' as const }
    }
  }
  return createObjectFromDefinition(template.type, position)
}

// Getter for dynamic templates
export const OBJECT_TEMPLATES: ObjectTemplate[] = []

// Update templates when window is available
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const templates = getObjectTemplates()
    OBJECT_TEMPLATES.length = 0
    OBJECT_TEMPLATES.push(...templates)
    console.log('Object templates loaded:', OBJECT_TEMPLATES.length, OBJECT_TEMPLATES.map(t => t.type))
  }, 100)
}