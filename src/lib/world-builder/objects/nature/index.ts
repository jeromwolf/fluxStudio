import { ObjectRegistry } from '../../object-system/registry'
import { TreeDefinition } from './tree'
import { RockDefinition } from './rock'
import { FlowerDefinition } from './flower'
import { BushDefinition } from './bush'

// Register all nature objects
export function registerNatureObjects() {
  const registry = ObjectRegistry.getInstance()
  
  // Register nature objects
  registry.register(TreeDefinition)
  registry.register(RockDefinition)
  registry.register(FlowerDefinition)
  registry.register(BushDefinition)
  
  console.log('Nature objects registered')
}

// Export all definitions
export * from './tree'
export * from './rock'
export * from './flower'
export * from './bush'