import { ObjectRegistry } from './object-system/registry'
import { PluginManager } from './object-system/plugin-system'
import { registerBasicObjects } from './objects/basic'
import { registerFurnitureObjects } from './objects/furniture'
import { registerAmusementParkObjects } from './objects/amusement-park'
import { registerNatureObjects } from './objects/nature'
import { registerSciFiObjects } from './objects/scifi'
import { registerFantasyObjects } from './objects/fantasy'
import { furniturePlugin } from './plugins/furniture-plugin'
import './objects/physics-test' // Auto-register physics test objects

// Initialize the world builder system
export function initializeWorldBuilder() {
  // Register basic objects
  registerBasicObjects()
  
  // Register furniture objects (new chair collection)
  registerFurnitureObjects()
  
  // Register themed objects
  registerAmusementParkObjects()
  registerNatureObjects()
  registerSciFiObjects()
  registerFantasyObjects()
  
  // Load plugins
  const pluginManager = PluginManager.getInstance()
  
  // Load furniture plugin
  pluginManager.loadPlugin(furniturePlugin).catch(console.error)
  
  // More plugins can be added here
  // pluginManager.loadPlugin(cityPlugin)
  // pluginManager.loadPlugin(homeDecorPlugin)
  // pluginManager.loadPlugin(gamingPlugin)
  
  console.log('World Builder initialized with', ObjectRegistry.getInstance().getAll().length, 'object types')
}

// Call this in your app initialization
if (typeof window !== 'undefined') {
  initializeWorldBuilder()
}