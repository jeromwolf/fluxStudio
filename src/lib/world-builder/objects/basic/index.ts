// Central registry for basic objects
export { CubeDefinition } from './cube'
export { SphereDefinition } from './sphere'
export { CylinderDefinition } from './cylinder'
export { ConeDefinition } from './cone'

import { CubeDefinition } from './cube'
import { SphereDefinition } from './sphere'
import { CylinderDefinition } from './cylinder'
import { ConeDefinition } from './cone'
import { ObjectRegistry } from '../../object-system/registry'

// Register all basic objects
export function registerBasicObjects() {
  const registry = ObjectRegistry.getInstance()
  
  registry.register(CubeDefinition)
  registry.register(SphereDefinition)
  registry.register(CylinderDefinition)
  registry.register(ConeDefinition)
  
  // More basic shapes can be added here:
  // registry.register(TorusDefinition)
  // registry.register(PlaneDefinition)
}