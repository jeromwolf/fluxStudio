import { ObjectRegistry } from '../../object-system/registry'
import { SpaceshipDefinition } from './spaceship'
import { PortalDefinition } from './portal'
import { HologramDefinition } from './hologram'
import { RobotDefinition } from './robot'

// Register all sci-fi objects
export function registerSciFiObjects() {
  const registry = ObjectRegistry.getInstance()
  
  // Register sci-fi objects
  registry.register(SpaceshipDefinition)
  registry.register(PortalDefinition)
  registry.register(HologramDefinition)
  registry.register(RobotDefinition)
  
  console.log('Sci-Fi objects registered')
}

// Export all definitions
export * from './spaceship'
export * from './portal'
export * from './hologram'
export * from './robot'