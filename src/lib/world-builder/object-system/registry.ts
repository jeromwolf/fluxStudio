import { 
  ObjectComponentDefinition, 
  ObjectCategory, 
  IObjectRegistry 
} from './types'

// Singleton object registry for managing all object types
export class ObjectRegistry implements IObjectRegistry {
  private static instance: ObjectRegistry
  private objects: Map<string, ObjectComponentDefinition> = new Map()
  private categories: Map<string, { name: string; icon: string }> = new Map()
  
  private constructor() {
    this.initializeDefaultCategories()
  }

  static getInstance(): ObjectRegistry {
    if (!ObjectRegistry.instance) {
      ObjectRegistry.instance = new ObjectRegistry()
    }
    return ObjectRegistry.instance
  }

  private initializeDefaultCategories() {
    const defaultCategories = [
      { id: ObjectCategory.BASIC, name: 'Basic Shapes', icon: '🟦' },
      { id: ObjectCategory.FURNITURE, name: 'Furniture', icon: '🪑' },
      { id: ObjectCategory.NATURE, name: 'Nature', icon: '🌳' },
      { id: ObjectCategory.BUILDING, name: 'Building', icon: '🏢' },
      { id: ObjectCategory.DECORATION, name: 'Decoration', icon: '🎨' },
      { id: ObjectCategory.INTERACTIVE, name: 'Interactive', icon: '🎮' },
      { id: ObjectCategory.LIGHTING, name: 'Lighting', icon: '💡' },
      { id: ObjectCategory.PARTICLE, name: 'Particles', icon: '✨' },
      { id: ObjectCategory.CUSTOM, name: 'Custom', icon: '📦' }
    ]

    defaultCategories.forEach(cat => {
      this.categories.set(cat.id, { name: cat.name, icon: cat.icon })
    })
  }

  register(definition: ObjectComponentDefinition): void {
    const type = definition.metadata.type
    if (this.objects.has(type)) {
      console.warn(`Object type "${type}" is already registered. Overwriting...`)
    }
    this.objects.set(type, definition)
  }

  unregister(type: string): void {
    this.objects.delete(type)
  }

  get(type: string): ObjectComponentDefinition | null {
    return this.objects.get(type) || null
  }

  getAll(): ObjectComponentDefinition[] {
    return Array.from(this.objects.values())
  }

  getByCategory(category: ObjectCategory): ObjectComponentDefinition[] {
    return this.getAll().filter(obj => obj.metadata.category === category)
  }

  search(query: string): ObjectComponentDefinition[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAll().filter(obj => {
      const metadata = obj.metadata
      return (
        metadata.name.toLowerCase().includes(lowercaseQuery) ||
        metadata.description?.toLowerCase().includes(lowercaseQuery) ||
        metadata.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    })
  }

  // Category management
  addCategory(id: string, name: string, icon: string): void {
    this.categories.set(id, { name, icon })
  }

  getCategories(): Array<{ id: string; name: string; icon: string }> {
    return Array.from(this.categories.entries()).map(([id, data]) => ({
      id,
      ...data
    }))
  }

  // Bulk registration for plugins
  registerMany(definitions: ObjectComponentDefinition[]): void {
    definitions.forEach(def => this.register(def))
  }

  // Export registry data for debugging or persistence
  export(): {
    objects: Array<{ type: string; definition: ObjectComponentDefinition }>
    categories: Array<{ id: string; name: string; icon: string }>
  } {
    return {
      objects: Array.from(this.objects.entries()).map(([type, def]) => ({
        type,
        definition: def
      })),
      categories: this.getCategories()
    }
  }

  // Clear registry (useful for testing)
  clear(): void {
    this.objects.clear()
    this.initializeDefaultCategories()
  }
}