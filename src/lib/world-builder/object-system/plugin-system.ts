import { ObjectPlugin, ObjectComponentDefinition } from './types'
import { ObjectRegistry } from './registry'
import { PropertySchema } from './property-system'

export interface PluginMetadata {
  name: string
  version: string
  author?: string
  description?: string
  dependencies?: string[]
  homepage?: string
}

export interface PluginContext {
  registry: ObjectRegistry
  registerObject: (definition: ObjectComponentDefinition) => void
  registerPropertySchema: (type: string, schema: PropertySchema) => void
  getPlugin: (name: string) => LoadedPlugin | null
}

export interface LoadedPlugin {
  metadata: PluginMetadata
  plugin: ObjectPlugin
  loaded: boolean
  error?: Error
}

export class PluginManager {
  private static instance: PluginManager
  private plugins: Map<string, LoadedPlugin> = new Map()
  private registry: ObjectRegistry
  private propertySchemas: Map<string, PropertySchema> = new Map()

  private constructor() {
    this.registry = ObjectRegistry.getInstance()
  }

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager()
    }
    return PluginManager.instance
  }

  private createContext(): PluginContext {
    return {
      registry: this.registry,
      registerObject: (definition) => this.registry.register(definition),
      registerPropertySchema: (type, schema) => this.propertySchemas.set(type, schema),
      getPlugin: (name) => this.plugins.get(name) || null
    }
  }

  async loadPlugin(plugin: ObjectPlugin): Promise<void> {
    const pluginName = plugin.name

    // Check if already loaded
    if (this.plugins.has(pluginName)) {
      console.warn(`Plugin "${pluginName}" is already loaded`)
      return
    }

    try {
      // Initialize plugin if needed
      if (plugin.initialize) {
        await plugin.initialize()
      }

      // Register objects
      if (plugin.objects) {
        plugin.objects.forEach(obj => {
          this.registry.register(obj)
        })
      }

      // Register categories
      if (plugin.categories) {
        plugin.categories.forEach(cat => {
          this.registry.addCategory(cat.id, cat.name, cat.icon)
        })
      }

      // Store plugin
      this.plugins.set(pluginName, {
        metadata: {
          name: plugin.name,
          version: plugin.version
        },
        plugin,
        loaded: true
      })

      console.log(`Plugin "${pluginName}" loaded successfully`)
    } catch (error) {
      console.error(`Failed to load plugin "${pluginName}":`, error)
      this.plugins.set(pluginName, {
        metadata: {
          name: plugin.name,
          version: plugin.version
        },
        plugin,
        loaded: false,
        error: error as Error
      })
      throw error
    }
  }

  unloadPlugin(pluginName: string): boolean {
    const loadedPlugin = this.plugins.get(pluginName)
    if (!loadedPlugin) {
      console.warn(`Plugin "${pluginName}" not found`)
      return false
    }

    // Unregister objects
    if (loadedPlugin.plugin.objects) {
      loadedPlugin.plugin.objects.forEach(obj => {
        this.registry.unregister(obj.metadata.type)
      })
    }

    // Remove plugin
    this.plugins.delete(pluginName)
    console.log(`Plugin "${pluginName}" unloaded`)
    return true
  }

  getPlugin(name: string): LoadedPlugin | null {
    return this.plugins.get(name) || null
  }

  getAllPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values())
  }

  getLoadedPlugins(): LoadedPlugin[] {
    return this.getAllPlugins().filter(p => p.loaded)
  }

  // Load multiple plugins
  async loadPlugins(plugins: ObjectPlugin[]): Promise<void> {
    for (const plugin of plugins) {
      await this.loadPlugin(plugin)
    }
  }

  // Property schema management
  getPropertySchema(type: string): PropertySchema | null {
    return this.propertySchemas.get(type) || null
  }

  getAllPropertySchemas(): Map<string, PropertySchema> {
    return new Map(this.propertySchemas)
  }
}

// Example plugin structure
export const examplePlugin: ObjectPlugin = {
  name: 'example-plugin',
  version: '1.0.0',
  initialize: async () => {
    console.log('Example plugin initializing...')
  },
  objects: [
    // Object definitions would go here
  ],
  categories: [
    { id: 'example', name: 'Example Objects', icon: '📦' }
  ]
}