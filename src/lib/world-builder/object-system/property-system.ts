// Property System - Extensible attribute management

export enum PropertyType {
  NUMBER = 'number',
  STRING = 'string',
  BOOLEAN = 'boolean',
  COLOR = 'color',
  VECTOR2 = 'vector2',
  VECTOR3 = 'vector3',
  ENUM = 'enum',
  RANGE = 'range',
  FILE = 'file',
  ARRAY = 'array',
  OBJECT = 'object',
  CUSTOM = 'custom'
}

export interface PropertyDefinition {
  key: string
  type: PropertyType
  label: string
  category?: string
  description?: string
  defaultValue?: any
  required?: boolean
  readonly?: boolean
  hidden?: boolean
  validators?: PropertyValidator[]
  metadata?: Record<string, any>
}

export interface PropertyValidator {
  type: 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message?: string
  validate?: (value: any) => boolean
}

// Specific property type definitions
export interface NumberProperty extends PropertyDefinition {
  type: PropertyType.NUMBER
  min?: number
  max?: number
  step?: number
  precision?: number
  unit?: string
}

export interface RangeProperty extends PropertyDefinition {
  type: PropertyType.RANGE
  min: number
  max: number
  step?: number
  showValue?: boolean
  marks?: Array<{ value: number; label: string }>
}

export interface ColorProperty extends PropertyDefinition {
  type: PropertyType.COLOR
  format?: 'hex' | 'rgb' | 'hsl'
  showAlpha?: boolean
  presets?: string[]
}

export interface Vector3Property extends PropertyDefinition {
  type: PropertyType.VECTOR3
  labels?: { x?: string; y?: string; z?: string }
  min?: { x?: number; y?: number; z?: number }
  max?: { x?: number; y?: number; z?: number }
  step?: number
  linked?: boolean // Link all axes together
}

export interface EnumProperty extends PropertyDefinition {
  type: PropertyType.ENUM
  options: Array<{
    value: string | number
    label: string
    icon?: string
    description?: string
  }>
  multiple?: boolean
}

export interface FileProperty extends PropertyDefinition {
  type: PropertyType.FILE
  accept?: string
  maxSize?: number
  preview?: boolean
}

export interface ArrayProperty extends PropertyDefinition {
  type: PropertyType.ARRAY
  itemType: PropertyDefinition
  minItems?: number
  maxItems?: number
  unique?: boolean
}

// Property group for organizing properties
export interface PropertyGroup {
  id: string
  label: string
  icon?: string
  description?: string
  collapsible?: boolean
  defaultExpanded?: boolean
  properties: PropertyDefinition[]
  conditions?: PropertyCondition[]
}

// Conditional property display
export interface PropertyCondition {
  property: string
  operator: '=' | '!=' | '>' | '<' | 'in' | 'contains'
  value: any
  action: 'show' | 'hide' | 'enable' | 'disable'
}

// Property schema for complete object definition
export interface PropertySchema {
  version: string
  groups: PropertyGroup[]
  properties: PropertyDefinition[]
  inheritance?: string[] // Inherit from other schemas
  mixins?: PropertyMixin[] // Composable property sets
}

// Mixin for reusable property sets
export interface PropertyMixin {
  id: string
  name: string
  properties: PropertyDefinition[]
  applyIf?: PropertyCondition[]
}

// Property value with metadata
export interface PropertyValue<T = any> {
  value: T
  timestamp?: number
  source?: 'default' | 'user' | 'system' | 'animation'
  history?: Array<{ value: T; timestamp: number }>
}

// Property change event
export interface PropertyChangeEvent {
  object: string // Object ID
  property: string
  oldValue: any
  newValue: any
  timestamp: number
  source: string
}

// Property manager interface
export interface IPropertyManager {
  // Schema management
  registerSchema(type: string, schema: PropertySchema): void
  getSchema(type: string): PropertySchema | null
  mergeSchemas(...schemas: PropertySchema[]): PropertySchema
  
  // Property operations
  getValue(object: any, property: string): any
  setValue(object: any, property: string, value: any): boolean
  validateValue(property: PropertyDefinition, value: any): boolean
  
  // Batch operations
  getValues(object: any, properties: string[]): Record<string, any>
  setValues(object: any, values: Record<string, any>): boolean
  
  // Property introspection
  getProperties(object: any): PropertyDefinition[]
  getPropertyGroups(object: any): PropertyGroup[]
  getEditableProperties(object: any): PropertyDefinition[]
  
  // Change tracking
  onChange(callback: (event: PropertyChangeEvent) => void): () => void
  getHistory(object: string, property: string): PropertyValue[]
}

// Common property mixins
export const CommonMixins = {
  Transform: {
    id: 'transform',
    name: 'Transform',
    properties: [
      {
        key: 'position',
        type: PropertyType.VECTOR3,
        label: 'Position',
        defaultValue: { x: 0, y: 0, z: 0 }
      } as Vector3Property,
      {
        key: 'rotation',
        type: PropertyType.VECTOR3,
        label: 'Rotation',
        defaultValue: { x: 0, y: 0, z: 0 },
        unit: 'degrees'
      } as Vector3Property,
      {
        key: 'scale',
        type: PropertyType.VECTOR3,
        label: 'Scale',
        defaultValue: { x: 1, y: 1, z: 1 },
        linked: true
      } as Vector3Property
    ]
  },
  
  Appearance: {
    id: 'appearance',
    name: 'Appearance',
    properties: [
      {
        key: 'color',
        type: PropertyType.COLOR,
        label: 'Color',
        defaultValue: '#808080'
      } as ColorProperty,
      {
        key: 'opacity',
        type: PropertyType.RANGE,
        label: 'Opacity',
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 1
      } as RangeProperty,
      {
        key: 'visible',
        type: PropertyType.BOOLEAN,
        label: 'Visible',
        defaultValue: true
      }
    ]
  },
  
  Physics: {
    id: 'physics',
    name: 'Physics',
    properties: [
      {
        key: 'mass',
        type: PropertyType.NUMBER,
        label: 'Mass',
        min: 0,
        defaultValue: 1,
        unit: 'kg'
      } as NumberProperty,
      {
        key: 'static',
        type: PropertyType.BOOLEAN,
        label: 'Static',
        defaultValue: false
      },
      {
        key: 'friction',
        type: PropertyType.RANGE,
        label: 'Friction',
        min: 0,
        max: 1,
        defaultValue: 0.5
      } as RangeProperty
    ]
  }
}

// Property builder for easy schema creation
export class PropertyBuilder {
  private schema: PropertySchema = {
    version: '1.0',
    groups: [],
    properties: []
  }

  addGroup(group: PropertyGroup): PropertyBuilder {
    this.schema.groups.push(group)
    return this
  }

  addProperty(property: PropertyDefinition): PropertyBuilder {
    this.schema.properties.push(property)
    return this
  }

  addMixin(mixin: PropertyMixin): PropertyBuilder {
    if (!this.schema.mixins) this.schema.mixins = []
    this.schema.mixins.push(mixin)
    return this
  }

  inherit(schemaId: string): PropertyBuilder {
    if (!this.schema.inheritance) this.schema.inheritance = []
    this.schema.inheritance.push(schemaId)
    return this
  }

  build(): PropertySchema {
    return this.schema
  }
}