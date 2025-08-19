import { ObjectRegistry } from '../../object-system/registry'
import {
  BasicChairDefinition,
  OfficeChairDefinition,
  DiningChairDefinition,
  GamingChairDefinition,
  StoolDefinition
} from './chairs'

// Register all furniture objects
export function registerFurnitureObjects() {
  const registry = ObjectRegistry.getInstance()
  
  // Register chairs
  registry.register(BasicChairDefinition)
  registry.register(OfficeChairDefinition)
  registry.register(DiningChairDefinition)
  registry.register(GamingChairDefinition)
  registry.register(StoolDefinition)
  
  // More furniture categories will be added here:
  // - Tables
  // - Sofas
  // - Beds
  // - Storage
  
  console.log('Furniture objects registered')
}

// Export all furniture definitions
export * from './chairs'