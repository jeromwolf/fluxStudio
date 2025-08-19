import { ObjectRegistry } from '../../object-system/registry'
import { CastleDefinition } from './castle'
import { MagicCircleDefinition } from './magic-circle'
import { CrystalDefinition } from './crystal'
import { DragonEggDefinition } from './dragon-egg'

// Register all fantasy objects
export function registerFantasyObjects() {
  const registry = ObjectRegistry.getInstance()
  
  // Register fantasy objects
  registry.register(CastleDefinition)
  registry.register(MagicCircleDefinition)
  registry.register(CrystalDefinition)
  registry.register(DragonEggDefinition)
  
  console.log('Fantasy objects registered')
}

// Export all definitions
export * from './castle'
export * from './magic-circle'
export * from './crystal'
export * from './dragon-egg'