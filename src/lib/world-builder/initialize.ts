import { ObjectRegistry } from './object-system/registry'
import { PluginManager } from './object-system/plugin-system'
import { registerBasicObjects } from './objects/basic'
import { furniturePlugin } from './plugins/furniture-plugin'

// Initialize the world builder system
export function initializeWorldBuilder() {
  // Register basic objects
  registerBasicObjects()
  
  // Load plugins
  const pluginManager = PluginManager.getInstance()
  
  // Load furniture plugin
  pluginManager.loadPlugin(furniturePlugin).catch(console.error)
  
  // More plugins can be added here
  // pluginManager.loadPlugin(naturePlugin)
  // pluginManager.loadPlugin(vehiclePlugin)
  // pluginManager.loadPlugin(lightingPlugin)
  
  console.log('World Builder initialized with', ObjectRegistry.getInstance().getAll().length, 'object types')
}

// Call this in your app initialization
if (typeof window !== 'undefined') {
  initializeWorldBuilder()
}