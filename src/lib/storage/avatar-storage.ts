export interface SavedAvatar {
  id: string
  name: string
  config: {
    color: string
    shape: 'sphere' | 'box' | 'cone' | 'cylinder'
    bodyType: 'normal' | 'tall' | 'short' | 'wide'
    accessories: {
      hat: boolean
      glasses: boolean
      wings: boolean
      tail: boolean
    }
  }
  createdAt: string
  updatedAt: string
  thumbnail?: string
}

export class AvatarStorage {
  private static readonly STORAGE_KEY = 'saved_avatars'
  private static readonly CURRENT_AVATAR_KEY = 'current_avatar'

  // Save a new avatar
  static saveAvatar(name: string, config: SavedAvatar['config']): SavedAvatar {
    const avatars = this.getAllAvatars()
    
    const newAvatar: SavedAvatar = {
      id: `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    avatars.push(newAvatar)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(avatars))
    
    return newAvatar
  }

  // Update existing avatar
  static updateAvatar(id: string, updates: Partial<SavedAvatar>): SavedAvatar | null {
    const avatars = this.getAllAvatars()
    const index = avatars.findIndex(a => a.id === id)
    
    if (index === -1) return null

    avatars[index] = {
      ...avatars[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(avatars))
    return avatars[index]
  }

  // Delete avatar
  static deleteAvatar(id: string): boolean {
    const avatars = this.getAllAvatars()
    const filtered = avatars.filter(a => a.id !== id)
    
    if (filtered.length === avatars.length) return false
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    return true
  }

  // Get all saved avatars
  static getAllAvatars(): SavedAvatar[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Get single avatar by ID
  static getAvatar(id: string): SavedAvatar | null {
    const avatars = this.getAllAvatars()
    return avatars.find(a => a.id === id) || null
  }

  // Set current active avatar
  static setCurrentAvatar(id: string): void {
    localStorage.setItem(this.CURRENT_AVATAR_KEY, id)
  }

  // Get current active avatar
  static getCurrentAvatar(): SavedAvatar | null {
    const currentId = localStorage.getItem(this.CURRENT_AVATAR_KEY)
    if (!currentId) return null
    return this.getAvatar(currentId)
  }

  // Export avatar as JSON
  static exportAvatar(id: string): string | null {
    const avatar = this.getAvatar(id)
    if (!avatar) return null
    return JSON.stringify(avatar, null, 2)
  }

  // Import avatar from JSON
  static importAvatar(jsonString: string): SavedAvatar | null {
    try {
      const data = JSON.parse(jsonString)
      if (!data.config || !data.name) return null
      
      return this.saveAvatar(data.name, data.config)
    } catch {
      return null
    }
  }
}