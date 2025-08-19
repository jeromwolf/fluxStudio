// Physics test objects for demonstrating physics functionality
export { PhysicsBoxObject, PhysicsBoxDefinition } from './physics-box'
export { PhysicsBallObject, PhysicsBallDefinition } from './physics-ball'

// Register physics test objects
import { ObjectRegistry } from '../../object-system/registry'
import { PhysicsBoxDefinition } from './physics-box'
import { PhysicsBallDefinition } from './physics-ball'

// Register when module is imported
if (typeof window !== 'undefined') {
  const registry = ObjectRegistry.getInstance()
  registry.register(PhysicsBoxDefinition)
  registry.register(PhysicsBallDefinition)
}