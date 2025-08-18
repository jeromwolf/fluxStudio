import * as THREE from 'three'
import { 
  WorldObject, 
  ObjectProperties, 
  IObjectFactory,
  ObjectComponentDefinition 
} from './types'
import { ObjectRegistry } from './registry'

export class ObjectFactory implements IObjectFactory {
  private static instance: ObjectFactory
  private registry: ObjectRegistry
  private idCounter: number = 0

  private constructor() {
    this.registry = ObjectRegistry.getInstance()
  }

  static getInstance(): ObjectFactory {
    if (!ObjectFactory.instance) {
      ObjectFactory.instance = new ObjectFactory()
    }
    return ObjectFactory.instance
  }

  private generateId(type: string): string {
    this.idCounter++
    return `${type}_${Date.now()}_${this.idCounter}`
  }

  create(type: string, properties?: Partial<ObjectProperties>): WorldObject | null {
    const definition = this.registry.get(type)
    if (!definition) {
      console.error(`Object type "${type}" not found in registry`)
      return null
    }

    const id = this.generateId(type)
    
    // Merge default properties with provided ones
    const defaultProps = definition.config.defaultProperties || {}
    const finalProperties: ObjectProperties = {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
      visible: true,
      ...defaultProps,
      ...properties
    }

    // Ensure THREE.js objects
    if (!(finalProperties.position instanceof THREE.Vector3)) {
      finalProperties.position = new THREE.Vector3(
        finalProperties.position.x || 0,
        finalProperties.position.y || 0,
        finalProperties.position.z || 0
      )
    }
    if (!(finalProperties.rotation instanceof THREE.Euler)) {
      finalProperties.rotation = new THREE.Euler(
        finalProperties.rotation.x || 0,
        finalProperties.rotation.y || 0,
        finalProperties.rotation.z || 0
      )
    }
    if (!(finalProperties.scale instanceof THREE.Vector3)) {
      finalProperties.scale = new THREE.Vector3(
        finalProperties.scale.x || 1,
        finalProperties.scale.y || 1,
        finalProperties.scale.z || 1
      )
    }

    const worldObject: WorldObject = {
      id,
      metadata: {
        ...definition.metadata,
        id
      },
      properties: finalProperties,
      config: definition.config,
      state: {}
    }

    return worldObject
  }

  clone(object: WorldObject): WorldObject {
    const clonedProperties: ObjectProperties = {
      position: object.properties.position.clone(),
      rotation: object.properties.rotation.clone(),
      scale: object.properties.scale.clone(),
      visible: object.properties.visible,
      userData: { ...object.properties.userData }
    }

    const cloned = this.create(object.metadata.type, clonedProperties)
    if (!cloned) return object

    // Clone state
    cloned.state = { ...object.state }

    // Clone mesh if exists
    if (object.mesh) {
      if (object.mesh instanceof THREE.Group) {
        cloned.mesh = object.mesh.clone()
      } else if (object.mesh instanceof THREE.Mesh) {
        cloned.mesh = object.mesh.clone()
      }
    }

    return cloned
  }

  serialize(object: WorldObject): string {
    const serializable = {
      id: object.id,
      metadata: object.metadata,
      properties: {
        position: {
          x: object.properties.position.x,
          y: object.properties.position.y,
          z: object.properties.position.z
        },
        rotation: {
          x: object.properties.rotation.x,
          y: object.properties.rotation.y,
          z: object.properties.rotation.z
        },
        scale: {
          x: object.properties.scale.x,
          y: object.properties.scale.y,
          z: object.properties.scale.z
        },
        visible: object.properties.visible,
        userData: object.properties.userData
      },
      state: object.state
    }

    return JSON.stringify(serializable, null, 2)
  }

  deserialize(data: string): WorldObject | null {
    try {
      const parsed = JSON.parse(data)
      
      // Check if the object type exists in registry
      const definition = this.registry.get(parsed.metadata.type)
      if (!definition) {
        console.error(`Cannot deserialize: type "${parsed.metadata.type}" not found`)
        return null
      }

      // Reconstruct properties
      const properties: ObjectProperties = {
        position: new THREE.Vector3(
          parsed.properties.position.x,
          parsed.properties.position.y,
          parsed.properties.position.z
        ),
        rotation: new THREE.Euler(
          parsed.properties.rotation.x,
          parsed.properties.rotation.y,
          parsed.properties.rotation.z
        ),
        scale: new THREE.Vector3(
          parsed.properties.scale.x,
          parsed.properties.scale.y,
          parsed.properties.scale.z
        ),
        visible: parsed.properties.visible ?? true,
        userData: parsed.properties.userData || {}
      }

      const worldObject: WorldObject = {
        id: parsed.id,
        metadata: parsed.metadata,
        properties,
        config: definition.config,
        state: parsed.state || {}
      }

      return worldObject
    } catch (error) {
      console.error('Failed to deserialize object:', error)
      return null
    }
  }

  // Batch operations
  createMany(
    items: Array<{ type: string; properties?: Partial<ObjectProperties> }>
  ): WorldObject[] {
    return items
      .map(item => this.create(item.type, item.properties))
      .filter((obj): obj is WorldObject => obj !== null)
  }

  // Create from template
  createFromTemplate(template: any): WorldObject | null {
    // This could be extended to support various template formats
    if (template.type && typeof template.type === 'string') {
      return this.create(template.type, template.properties)
    }
    return null
  }
}