import { ComponentType } from 'react'
import * as THREE from 'three'

// Core object properties that all objects share
export interface ObjectProperties {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  visible?: boolean
  userData?: Record<string, any>
}

// Object metadata for the system
export interface ObjectMetadata {
  id: string
  type: string
  name: string
  category: ObjectCategory
  icon: string
  description?: string
  tags?: string[]
  author?: string
  version?: string
}

// Categories for organizing objects
export enum ObjectCategory {
  BASIC = 'basic',
  FURNITURE = 'furniture',
  NATURE = 'nature',
  BUILDING = 'building',
  DECORATION = 'decoration',
  INTERACTIVE = 'interactive',
  LIGHTING = 'lighting',
  PARTICLE = 'particle',
  CUSTOM = 'custom'
}

// Configuration for creating objects
export interface ObjectConfig {
  defaultProperties?: Partial<ObjectProperties>
  constraints?: ObjectConstraints
  interactions?: ObjectInteractions
  materials?: ObjectMaterials
  animations?: ObjectAnimation[]
}

// Constraints for object placement and manipulation
export interface ObjectConstraints {
  minScale?: number
  maxScale?: number
  lockRotation?: boolean
  lockPosition?: boolean
  snapToGrid?: boolean
  gridSize?: number
  placementRules?: PlacementRule[]
}

// Placement rules for advanced positioning
export interface PlacementRule {
  type: 'ground' | 'wall' | 'ceiling' | 'surface' | 'air'
  offset?: number
  allowedSurfaces?: string[]
}

// Object interaction definitions
export interface ObjectInteractions {
  clickable?: boolean
  hoverable?: boolean
  draggable?: boolean
  selectable?: boolean
  onInteract?: (object: WorldObject) => void
  customActions?: CustomAction[]
}

// Custom actions for objects
export interface CustomAction {
  id: string
  name: string
  icon?: string
  handler: (object: WorldObject) => void
}

// Material system for objects
export interface ObjectMaterials {
  default: MaterialConfig
  variants?: Record<string, MaterialConfig>
  allowColorChange?: boolean
  allowTextureChange?: boolean
}

// Material configuration
export interface MaterialConfig {
  type: 'basic' | 'standard' | 'phong' | 'physical' | 'toon' | 'custom'
  color?: string
  texture?: string
  metalness?: number
  roughness?: number
  opacity?: number
  transparent?: boolean
  emissive?: string
  emissiveIntensity?: number
}

// Animation definitions
export interface ObjectAnimation {
  id: string
  name: string
  type: 'rotation' | 'position' | 'scale' | 'morph' | 'custom'
  duration: number
  loop?: boolean
  autoPlay?: boolean
  config: Record<string, any>
}

// Complete world object instance
export interface WorldObject {
  id: string
  metadata: ObjectMetadata
  properties: ObjectProperties
  config: ObjectConfig
  mesh?: THREE.Mesh | THREE.Group
  state?: Record<string, any>
}

// Object component definition
export interface ObjectComponentDefinition {
  metadata: Omit<ObjectMetadata, 'id'>
  config: ObjectConfig
  component: ComponentType<ObjectComponentProps>
  loader?: () => Promise<THREE.Object3D>
}

// Props passed to object components
export interface ObjectComponentProps {
  object: WorldObject
  isSelected?: boolean
  isPreview?: boolean
  onUpdate?: (updates: Partial<ObjectProperties>) => void
}

// Object registry interface
export interface IObjectRegistry {
  register(definition: ObjectComponentDefinition): void
  unregister(type: string): void
  get(type: string): ObjectComponentDefinition | null
  getAll(): ObjectComponentDefinition[]
  getByCategory(category: ObjectCategory): ObjectComponentDefinition[]
  search(query: string): ObjectComponentDefinition[]
}

// Object factory interface
export interface IObjectFactory {
  create(type: string, properties?: Partial<ObjectProperties>): WorldObject | null
  clone(object: WorldObject): WorldObject
  serialize(object: WorldObject): string
  deserialize(data: string): WorldObject | null
}

// Object plugin interface for extensibility
export interface ObjectPlugin {
  name: string
  version: string
  initialize?: () => void
  objects?: ObjectComponentDefinition[]
  categories?: Array<{ id: string; name: string; icon: string }>
  materials?: Record<string, MaterialConfig>
  actions?: CustomAction[]
}