import { ObjectRegistry } from '../../object-system/registry'
import { RollerCoasterDefinition } from './roller-coaster'
import { FerrisWheelDefinition } from './ferris-wheel'
import { CarouselDefinition } from './carousel'
import { BumperCarsDefinition } from './bumper-cars'

// Register all amusement park objects
export function registerAmusementParkObjects() {
  const registry = ObjectRegistry.getInstance()
  
  // Register rides
  registry.register(RollerCoasterDefinition)
  registry.register(FerrisWheelDefinition)
  registry.register(CarouselDefinition)
  registry.register(BumperCarsDefinition)
  
  console.log('Amusement park objects registered')
}

// Export all definitions
export * from './roller-coaster'
export * from './ferris-wheel'
export * from './carousel'
export * from './bumper-cars'