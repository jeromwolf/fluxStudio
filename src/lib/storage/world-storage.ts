import * as THREE from 'three'

export interface SavedObject {
  id: string
  type: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  color?: string
  metadata?: Record<string, any>
}

export interface SavedWorld {
  id: string
  name: string
  description?: string
  objects: SavedObject[]
  settings: {
    skyColor?: string
    groundColor?: string
    fogColor?: string
    fogDensity?: number
    lightIntensity?: number
  }
  createdAt: string
  updatedAt: string
  thumbnail?: string
  isPublic?: boolean
  tags?: string[]
}

export class WorldStorage {
  private static readonly STORAGE_KEY = 'saved_worlds'
  private static readonly CURRENT_WORLD_KEY = 'current_world'
  private static readonly MAX_WORLDS = 50 // Limit to prevent storage overflow

  // Save a new world
  static saveWorld(
    name: string, 
    objects: SavedObject[], 
    settings: SavedWorld['settings'] = {},
    description?: string
  ): SavedWorld {
    const worlds = this.getAllWorlds()
    
    // Check storage limit
    if (worlds.length >= this.MAX_WORLDS) {
      throw new Error(`Maximum world limit (${this.MAX_WORLDS}) reached`)
    }

    const newWorld: SavedWorld = {
      id: `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      objects,
      settings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      tags: []
    }

    worlds.push(newWorld)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(worlds))
    
    return newWorld
  }

  // Update existing world
  static updateWorld(id: string, updates: Partial<SavedWorld>): SavedWorld | null {
    const worlds = this.getAllWorlds()
    const index = worlds.findIndex(w => w.id === id)
    
    if (index === -1) return null

    worlds[index] = {
      ...worlds[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(worlds))
    return worlds[index]
  }

  // Delete world
  static deleteWorld(id: string): boolean {
    const worlds = this.getAllWorlds()
    const filtered = worlds.filter(w => w.id !== id)
    
    if (filtered.length === worlds.length) return false
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    return true
  }

  // Get all saved worlds
  static getAllWorlds(): SavedWorld[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Get single world by ID
  static getWorld(id: string): SavedWorld | null {
    const worlds = this.getAllWorlds()
    return worlds.find(w => w.id === id) || null
  }

  // Set current active world
  static setCurrentWorld(id: string): void {
    localStorage.setItem(this.CURRENT_WORLD_KEY, id)
  }

  // Get current active world
  static getCurrentWorld(): SavedWorld | null {
    const currentId = localStorage.getItem(this.CURRENT_WORLD_KEY)
    if (!currentId) return null
    return this.getWorld(currentId)
  }

  // Export world as JSON
  static exportWorld(id: string): string | null {
    const world = this.getWorld(id)
    if (!world) return null
    return JSON.stringify(world, null, 2)
  }

  // Import world from JSON
  static importWorld(jsonString: string): SavedWorld | null {
    try {
      const data = JSON.parse(jsonString)
      if (!data.name || !data.objects) return null
      
      return this.saveWorld(
        data.name, 
        data.objects, 
        data.settings || {}, 
        data.description
      )
    } catch {
      return null
    }
  }

  // Search worlds by name or tags
  static searchWorlds(query: string): SavedWorld[] {
    const worlds = this.getAllWorlds()
    const lowercaseQuery = query.toLowerCase()
    
    return worlds.filter(world => 
      world.name.toLowerCase().includes(lowercaseQuery) ||
      world.description?.toLowerCase().includes(lowercaseQuery) ||
      world.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; limit: number; worldCount: number } {
    const worlds = this.getAllWorlds()
    const used = new Blob([JSON.stringify(worlds)]).size
    const limit = 5 * 1024 * 1024 // 5MB estimated localStorage limit
    
    return {
      used,
      limit,
      worldCount: worlds.length
    }
  }

  // Clear all worlds (with confirmation)
  static clearAllWorlds(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.CURRENT_WORLD_KEY)
  }

  // Create world from current scene objects
  static createWorldFromScene(
    placedObjects: Array<{
      id: string
      type: string
      mesh: THREE.Mesh
      position: THREE.Vector3
      rotation: THREE.Euler
      scale: THREE.Vector3
    }>
  ): SavedObject[] {
    return placedObjects.map(obj => {
      const savedObject: SavedObject = {
        id: obj.id,
        type: obj.type,
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z
        },
        rotation: {
          x: obj.rotation.x,
          y: obj.rotation.y,
          z: obj.rotation.z
        },
        scale: {
          x: obj.scale.x,
          y: obj.scale.y,
          z: obj.scale.z
        }
      }

      // Extract color if available
      if (obj.mesh.material) {
        const material = Array.isArray(obj.mesh.material) 
          ? obj.mesh.material[0] 
          : obj.mesh.material
        if ('color' in material) {
          savedObject.color = '#' + material.color.getHexString()
        }
      }

      return savedObject
    })
  }
}