import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { AvatarCustomization } from '@/features/avatar/types'
import { avatarPersistence } from './persistence'

// Avatar Store State
export interface AvatarStoreState {
  // Current avatar being customized
  currentAvatar: AvatarCustomization | null
  
  // User's saved avatars
  savedAvatars: AvatarCustomization[]
  
  // Customization state
  isCustomizing: boolean
  hasUnsavedChanges: boolean
  
  // Selected avatar for use
  selectedAvatarId: string | null
  
  // Preferences
  preferences: {
    defaultAvatarType: 'humanoid' | 'creature' | 'robot' | 'fantasy'
    autoSave: boolean
    showPreviewInWorld: boolean
  }
  
  // Currency for premium items
  fluxCoins: number
  
  // Unlocked items
  unlockedItems: {
    clothing: string[]
    accessories: string[]
    effects: string[]
    presets: string[]
  }
}

// Avatar Store Actions
export interface AvatarStoreActions {
  // Avatar CRUD
  createAvatar: (name: string, type?: AvatarCustomization['type']) => void
  saveAvatar: (avatar: AvatarCustomization) => void
  deleteAvatar: (avatarId: string) => void
  duplicateAvatar: (avatarId: string) => void
  
  // Current avatar management
  setCurrentAvatar: (avatar: AvatarCustomization | null) => void
  updateCurrentAvatar: (updates: Partial<AvatarCustomization>) => void
  selectAvatar: (avatarId: string | null) => void
  
  // Customization state
  startCustomizing: (avatar?: AvatarCustomization) => void
  stopCustomizing: (save?: boolean) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  // Preferences
  updatePreferences: (preferences: Partial<AvatarStoreState['preferences']>) => void
  
  // Currency and items
  addFluxCoins: (amount: number) => void
  spendFluxCoins: (amount: number) => boolean
  unlockItem: (category: keyof AvatarStoreState['unlockedItems'], itemId: string) => void
  isItemUnlocked: (category: keyof AvatarStoreState['unlockedItems'], itemId: string) => boolean
  
  // Data management
  exportAvatarData: () => string
  importAvatarData: (data: string) => boolean
  syncWithCloud: () => Promise<void>
  
  // Utility
  reset: () => void
}

// Default avatar template
const createDefaultAvatar = (name: string, type: AvatarCustomization['type'] = 'humanoid'): AvatarCustomization => ({
  id: `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name,
  type,
  body: {
    type: 'normal',
    height: 1.0,
    skinColor: '#F5C6A0'
  },
  face: {
    shape: 'oval',
    eyes: { type: 'normal', color: '#4A5568', lashes: true },
    eyebrows: { type: 'normal', color: '#2D3748' },
    nose: { type: 'normal' },
    mouth: { type: 'normal', lipColor: '#E53E3E' }
  },
  hair: {
    style: 'medium',
    color: '#2D3748'
  },
  clothing: {
    top: { id: 'tshirt-1', name: '기본 티셔츠', type: 'shirt', style: 'casual', color: '#3182CE' },
    bottom: { id: 'jeans-1', name: '기본 청바지', type: 'pants', style: 'casual', color: '#2B6CB0' },
    shoes: { id: 'sneakers-1', name: '기본 운동화', type: 'sneakers', style: 'casual', color: '#FFFFFF' }
  },
  accessories: {},
  animations: {
    idle: { id: 'idle-1', name: '기본', speed: 1.0, loop: true },
    walk: { id: 'walk-1', name: '걷기', speed: 1.0, loop: true },
    run: { id: 'run-1', name: '달리기', speed: 1.2, loop: true },
    emotes: ['wave', 'thumbsup', 'dance']
  }
})

// Initial state
const initialState: AvatarStoreState = {
  currentAvatar: null,
  savedAvatars: [],
  isCustomizing: false,
  hasUnsavedChanges: false,
  selectedAvatarId: null,
  preferences: {
    defaultAvatarType: 'humanoid',
    autoSave: true,
    showPreviewInWorld: true
  },
  fluxCoins: 1000, // Start with some coins
  unlockedItems: {
    clothing: ['tshirt-1', 'jeans-1', 'sneakers-1'], // Basic items unlocked
    accessories: [],
    effects: [],
    presets: []
  }
}

// Create the avatar store
export const useAvatarStore = create<AvatarStoreState & AvatarStoreActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Avatar CRUD
        createAvatar: (name, type = 'humanoid') => {
          const newAvatar = createDefaultAvatar(name, type)
          set((state) => {
            state.currentAvatar = newAvatar
            state.isCustomizing = true
            state.hasUnsavedChanges = true
          })
        },
        
        saveAvatar: (avatar) => set((state) => {
          const existingIndex = state.savedAvatars.findIndex(a => a.id === avatar.id)
          if (existingIndex >= 0) {
            state.savedAvatars[existingIndex] = avatar
          } else {
            state.savedAvatars.push(avatar)
          }
          state.hasUnsavedChanges = false
          state.currentAvatar = avatar
        }),
        
        deleteAvatar: (avatarId) => set((state) => {
          state.savedAvatars = state.savedAvatars.filter(a => a.id !== avatarId)
          if (state.selectedAvatarId === avatarId) {
            state.selectedAvatarId = null
          }
          if (state.currentAvatar?.id === avatarId) {
            state.currentAvatar = null
          }
        }),
        
        duplicateAvatar: (avatarId) => {
          const original = get().savedAvatars.find(a => a.id === avatarId)
          if (original) {
            const duplicate = {
              ...original,
              id: `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: `${original.name} 복사본`
            }
            set((state) => {
              state.savedAvatars.push(duplicate)
            })
          }
        },
        
        // Current avatar management
        setCurrentAvatar: (avatar) => set((state) => {
          state.currentAvatar = avatar
          state.hasUnsavedChanges = false
        }),
        
        updateCurrentAvatar: (updates) => set((state) => {
          if (state.currentAvatar) {
            Object.assign(state.currentAvatar, updates)
            state.hasUnsavedChanges = true
            
            // Auto-save if enabled
            if (state.preferences.autoSave && state.currentAvatar.id) {
              const existingIndex = state.savedAvatars.findIndex(a => a.id === state.currentAvatar!.id)
              if (existingIndex >= 0) {
                state.savedAvatars[existingIndex] = { ...state.currentAvatar }
                state.hasUnsavedChanges = false
              }
            }
          }
        }),
        
        selectAvatar: (avatarId) => set((state) => {
          state.selectedAvatarId = avatarId
        }),
        
        // Customization state
        startCustomizing: (avatar) => set((state) => {
          if (avatar) {
            state.currentAvatar = { ...avatar }
          }
          state.isCustomizing = true
          state.hasUnsavedChanges = false
        }),
        
        stopCustomizing: (save = false) => {
          const { currentAvatar, savedAvatars } = get()
          
          set((state) => {
            if (save && state.currentAvatar) {
              const existingIndex = state.savedAvatars.findIndex(a => a.id === state.currentAvatar!.id)
              if (existingIndex >= 0) {
                state.savedAvatars[existingIndex] = state.currentAvatar
              } else {
                state.savedAvatars.push(state.currentAvatar)
              }
              state.hasUnsavedChanges = false
            }
            state.isCustomizing = false
          })
        },
        
        setHasUnsavedChanges: (hasChanges) => set((state) => {
          state.hasUnsavedChanges = hasChanges
        }),
        
        // Preferences
        updatePreferences: (preferences) => set((state) => {
          Object.assign(state.preferences, preferences)
        }),
        
        // Currency and items
        addFluxCoins: (amount) => set((state) => {
          state.fluxCoins += amount
        }),
        
        spendFluxCoins: (amount) => {
          const { fluxCoins } = get()
          if (fluxCoins >= amount) {
            set((state) => {
              state.fluxCoins -= amount
            })
            return true
          }
          return false
        },
        
        unlockItem: (category, itemId) => set((state) => {
          if (!state.unlockedItems[category].includes(itemId)) {
            state.unlockedItems[category].push(itemId)
          }
        }),
        
        isItemUnlocked: (category, itemId) => {
          return get().unlockedItems[category].includes(itemId)
        },
        
        // Data management
        exportAvatarData: () => {
          const { savedAvatars, preferences, unlockedItems } = get()
          return JSON.stringify({
            savedAvatars,
            preferences,
            unlockedItems,
            exportedAt: new Date().toISOString()
          })
        },
        
        importAvatarData: (data) => {
          try {
            const parsed = JSON.parse(data)
            if (parsed.savedAvatars && Array.isArray(parsed.savedAvatars)) {
              set((state) => {
                state.savedAvatars = [...state.savedAvatars, ...parsed.savedAvatars]
                if (parsed.preferences) {
                  state.preferences = { ...state.preferences, ...parsed.preferences }
                }
                if (parsed.unlockedItems) {
                  Object.keys(parsed.unlockedItems).forEach((category) => {
                    const cat = category as keyof AvatarStoreState['unlockedItems']
                    if (state.unlockedItems[cat]) {
                      state.unlockedItems[cat] = [
                        ...new Set([...state.unlockedItems[cat], ...parsed.unlockedItems[cat]])
                      ]
                    }
                  })
                }
              })
              return true
            }
          } catch (error) {
            console.error('Failed to import avatar data:', error)
          }
          return false
        },
        
        syncWithCloud: async () => {
          try {
            await avatarPersistence.manualSync()
            console.log('✅ Avatar data synced to cloud')
          } catch (error) {
            console.error('❌ Failed to sync avatar data:', error)
          }
        },
        
        // Utility
        reset: () => set(() => ({ ...initialState }))
      })),
      {
        name: 'avatar-store',
        storage: avatarPersistence,
        partialize: (state) => ({
          savedAvatars: state.savedAvatars,
          selectedAvatarId: state.selectedAvatarId,
          preferences: state.preferences,
          fluxCoins: state.fluxCoins,
          unlockedItems: state.unlockedItems
        })
      }
    ),
    {
      name: 'avatar-store'
    }
  )
)

// Convenience selectors
export const useCurrentAvatar = () => useAvatarStore((state) => state.currentAvatar)
export const useSavedAvatars = () => useAvatarStore((state) => state.savedAvatars)
export const useSelectedAvatar = () => useAvatarStore((state) => {
  const selectedId = state.selectedAvatarId
  return selectedId ? state.savedAvatars.find(a => a.id === selectedId) : null
})
export const useAvatarCustomizing = () => useAvatarStore((state) => ({
  isCustomizing: state.isCustomizing,
  hasUnsavedChanges: state.hasUnsavedChanges
}))
export const useFluxCoins = () => useAvatarStore((state) => state.fluxCoins)