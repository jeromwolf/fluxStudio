import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { World } from '@/core/database/types'
import type { WorldObject, WorldSettings } from '@/core/database/types'
import { worldPersistence } from './persistence'

// World Store State
export interface WorldStoreState {
  // Current world being edited
  currentWorld: World | null
  
  // User's saved worlds
  savedWorlds: World[]
  
  // World builder state
  isBuilding: boolean
  hasUnsavedChanges: boolean
  
  // Selected world for visiting
  selectedWorldId: string | null
  
  // Builder tools
  builderState: {
    mode: 'build' | 'select' | 'move' | 'delete'
    selectedObjectId: string | null
    selectedObjectType: string | null
    isGridVisible: boolean
    snapToGrid: boolean
    gridSize: number
  }
  
  // World objects in current session
  worldObjects: WorldObject[]
  
  // World settings for current world
  worldSettings: WorldSettings
  
  // Clipboard for copy/paste
  clipboard: {
    objects: WorldObject[]
    operation: 'copy' | 'cut' | null
  }
  
  // Undo/Redo system
  history: {
    states: WorldObject[][]
    currentIndex: number
    maxHistory: number
  }
  
  // Preferences
  preferences: {
    defaultTheme: string
    autoSave: boolean
    showObjectNames: boolean
    renderDistance: number
  }
}

// World Store Actions
export interface WorldStoreActions {
  // World CRUD
  createWorld: (data: { name: string; description?: string; visibility?: 'public' | 'private' | 'friends'; maxPlayers?: number; theme?: string }) => World | null
  saveWorld: (world?: World) => void
  deleteWorld: (worldId: string) => void
  duplicateWorld: (worldId: string) => void
  loadWorld: (worldId: string) => void
  
  // Current world management
  setCurrentWorld: (world: World | null) => void
  updateCurrentWorld: (updates: Partial<World>) => void
  selectWorld: (worldId: string | null) => void
  
  // World building state
  startBuilding: (world?: World) => void
  stopBuilding: (save?: boolean) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  // Builder tools
  setBuilderMode: (mode: WorldStoreState['builderState']['mode']) => void
  selectObject: (objectId: string | null) => void
  setSelectedObjectType: (type: string | null) => void
  toggleGrid: () => void
  setSnapToGrid: (snap: boolean) => void
  setGridSize: (size: number) => void
  
  // Object management
  addObject: (object: Omit<WorldObject, 'id'>) => void
  updateObject: (objectId: string, updates: Partial<WorldObject>) => void
  deleteObject: (objectId: string) => void
  moveObject: (objectId: string, position: WorldObject['position']) => void
  rotateObject: (objectId: string, rotation: WorldObject['rotation']) => void
  scaleObject: (objectId: string, scale: WorldObject['scale']) => void
  
  // Bulk operations
  selectMultipleObjects: (objectIds: string[]) => void
  deleteSelectedObjects: () => void
  copySelectedObjects: () => void
  cutSelectedObjects: () => void
  pasteObjects: () => void
  
  // History management
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // World settings
  updateWorldSettings: (settings: Partial<WorldSettings>) => void
  
  // Import/Export
  exportWorld: (worldId?: string) => string
  importWorld: (data: string) => boolean
  
  // Preferences
  updatePreferences: (preferences: Partial<WorldStoreState['preferences']>) => void
  
  // Cloud sync
  syncWithCloud: () => Promise<void>
  
  // Migration and cloud functions
  migrateFromLocalStorage: (userId: string) => Promise<{ migratedWorlds: any[]; errors: string[] }>
  loadFromCloud: (userId: string) => Promise<any[]>
  
  // Utility
  reset: () => void
}

// Default world settings
const createDefaultWorldSettings = (): WorldSettings => ({
  theme: 'default',
  lighting: 'day',
  weather: 'clear',
  physics: {
    gravity: -9.81,
    wind: 0
  },
  audio: {
    ambientSound: 'nature',
    musicVolume: 0.3
  }
})

// Default world template
const createDefaultWorld = (name: string, theme = 'default'): Omit<World, 'createdAt' | 'updatedAt'> => ({
  id: `world-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  creatorId: 'temp-user', // Will be replaced when user is authenticated
  name,
  description: '',
  thumbnailUrl: null,
  visibility: 'private',
  maxPlayers: 20,
  objects: [],
  settings: {
    ...createDefaultWorldSettings(),
    theme
  }
})

// Initial state
const initialState: WorldStoreState = {
  currentWorld: null,
  savedWorlds: [],
  isBuilding: false,
  hasUnsavedChanges: false,
  selectedWorldId: null,
  builderState: {
    mode: 'build',
    selectedObjectId: null,
    selectedObjectType: null,
    isGridVisible: true,
    snapToGrid: true,
    gridSize: 1
  },
  worldObjects: [],
  worldSettings: createDefaultWorldSettings(),
  clipboard: {
    objects: [],
    operation: null
  },
  history: {
    states: [],
    currentIndex: -1,
    maxHistory: 50
  },
  preferences: {
    defaultTheme: 'default',
    autoSave: true,
    showObjectNames: true,
    renderDistance: 100
  }
}

// Create the world store
export const useWorldStore = create<WorldStoreState & WorldStoreActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // World CRUD
        createWorld: (data) => {
          const newWorld = {
            ...createDefaultWorld(data.name, data.theme || 'default'),
            description: data.description || '',
            visibility: data.visibility || 'private',
            maxPlayers: data.maxPlayers || 20,
            createdAt: new Date(),
            updatedAt: new Date()
          } as World
          
          set((state) => {
            state.currentWorld = newWorld
            state.worldObjects = []
            state.worldSettings = newWorld.settings as WorldSettings
            state.isBuilding = true
            state.hasUnsavedChanges = true
            // Initialize history
            state.history.states = [[]]
            state.history.currentIndex = 0
            // Add to saved worlds immediately
            state.savedWorlds.push(newWorld)
          })
          
          return newWorld
        },
        
        saveWorld: (world) => {
          const { currentWorld, worldObjects, worldSettings } = get()
          const worldToSave = world || currentWorld
          
          if (worldToSave) {
            const updatedWorld = {
              ...worldToSave,
              objects: worldObjects,
              settings: worldSettings,
              updatedAt: new Date()
            }
            
            set((state) => {
              const existingIndex = state.savedWorlds.findIndex(w => w.id === updatedWorld.id)
              if (existingIndex >= 0) {
                state.savedWorlds[existingIndex] = updatedWorld
              } else {
                state.savedWorlds.push(updatedWorld)
              }
              state.currentWorld = updatedWorld
              state.hasUnsavedChanges = false
            })
          }
        },
        
        deleteWorld: (worldId) => set((state) => {
          state.savedWorlds = state.savedWorlds.filter(w => w.id !== worldId)
          if (state.selectedWorldId === worldId) {
            state.selectedWorldId = null
          }
          if (state.currentWorld?.id === worldId) {
            state.currentWorld = null
            state.worldObjects = []
            state.isBuilding = false
          }
        }),
        
        duplicateWorld: (worldId) => {
          const original = get().savedWorlds.find(w => w.id === worldId)
          if (original) {
            const duplicate = {
              ...original,
              id: `world-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: `${original.name} 복사본`,
              createdAt: new Date(),
              updatedAt: new Date()
            }
            set((state) => {
              state.savedWorlds.push(duplicate)
            })
          }
        },
        
        loadWorld: (worldId) => {
          const world = get().savedWorlds.find(w => w.id === worldId)
          if (world) {
            set((state) => {
              state.currentWorld = world
              state.worldObjects = (world.objects as WorldObject[]) || []
              state.worldSettings = (world.settings as WorldSettings) || createDefaultWorldSettings()
              state.hasUnsavedChanges = false
              // Reset history
              state.history.states = [state.worldObjects]
              state.history.currentIndex = 0
            })
          }
        },
        
        // Current world management
        setCurrentWorld: (world) => set((state) => {
          state.currentWorld = world
          state.hasUnsavedChanges = false
        }),
        
        updateCurrentWorld: (updates) => set((state) => {
          if (state.currentWorld) {
            Object.assign(state.currentWorld, updates)
            state.hasUnsavedChanges = true
          }
        }),
        
        selectWorld: (worldId) => set((state) => {
          state.selectedWorldId = worldId
        }),
        
        // World building state
        startBuilding: (world) => set((state) => {
          if (world) {
            state.currentWorld = world
            state.worldObjects = (world.objects as WorldObject[]) || []
            state.worldSettings = (world.settings as WorldSettings) || createDefaultWorldSettings()
          }
          state.isBuilding = true
          state.hasUnsavedChanges = false
        }),
        
        stopBuilding: (save = false) => {
          if (save) {
            get().saveWorld()
          }
          set((state) => {
            state.isBuilding = false
          })
        },
        
        setHasUnsavedChanges: (hasChanges) => set((state) => {
          state.hasUnsavedChanges = hasChanges
        }),
        
        // Builder tools
        setBuilderMode: (mode) => set((state) => {
          state.builderState.mode = mode
          if (mode !== 'select') {
            state.builderState.selectedObjectId = null
          }
        }),
        
        selectObject: (objectId) => set((state) => {
          state.builderState.selectedObjectId = objectId
          if (objectId) {
            state.builderState.mode = 'select'
          }
        }),
        
        setSelectedObjectType: (type) => set((state) => {
          state.builderState.selectedObjectType = type
        }),
        
        toggleGrid: () => set((state) => {
          state.builderState.isGridVisible = !state.builderState.isGridVisible
        }),
        
        setSnapToGrid: (snap) => set((state) => {
          state.builderState.snapToGrid = snap
        }),
        
        setGridSize: (size) => set((state) => {
          state.builderState.gridSize = size
        }),
        
        // Object management
        addObject: (objectData) => {
          const newObject: WorldObject = {
            id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...objectData
          }
          
          set((state) => {
            state.worldObjects.push(newObject)
            state.hasUnsavedChanges = true
          })
          
          get().saveToHistory()
        },
        
        updateObject: (objectId, updates) => set((state) => {
          const object = state.worldObjects.find(obj => obj.id === objectId)
          if (object) {
            Object.assign(object, updates)
            state.hasUnsavedChanges = true
          }
        }),
        
        deleteObject: (objectId) => {
          set((state) => {
            state.worldObjects = state.worldObjects.filter(obj => obj.id !== objectId)
            if (state.builderState.selectedObjectId === objectId) {
              state.builderState.selectedObjectId = null
            }
            state.hasUnsavedChanges = true
          })
          get().saveToHistory()
        },
        
        moveObject: (objectId, position) => {
          get().updateObject(objectId, { position })
          get().saveToHistory()
        },
        
        rotateObject: (objectId, rotation) => {
          get().updateObject(objectId, { rotation })
          get().saveToHistory()
        },
        
        scaleObject: (objectId, scale) => {
          get().updateObject(objectId, { scale })
          get().saveToHistory()
        },
        
        // Bulk operations
        selectMultipleObjects: (objectIds) => set((state) => {
          // For now, just select the first one
          state.builderState.selectedObjectId = objectIds[0] || null
        }),
        
        deleteSelectedObjects: () => {
          const { builderState } = get()
          if (builderState.selectedObjectId) {
            get().deleteObject(builderState.selectedObjectId)
          }
        },
        
        copySelectedObjects: () => {
          const { builderState, worldObjects } = get()
          if (builderState.selectedObjectId) {
            const selectedObject = worldObjects.find(obj => obj.id === builderState.selectedObjectId)
            if (selectedObject) {
              set((state) => {
                state.clipboard.objects = [selectedObject]
                state.clipboard.operation = 'copy'
              })
            }
          }
        },
        
        cutSelectedObjects: () => {
          const { builderState, worldObjects } = get()
          if (builderState.selectedObjectId) {
            const selectedObject = worldObjects.find(obj => obj.id === builderState.selectedObjectId)
            if (selectedObject) {
              set((state) => {
                state.clipboard.objects = [selectedObject]
                state.clipboard.operation = 'cut'
                state.worldObjects = state.worldObjects.filter(obj => obj.id !== builderState.selectedObjectId)
                state.builderState.selectedObjectId = null
                state.hasUnsavedChanges = true
              })
              get().saveToHistory()
            }
          }
        },
        
        pasteObjects: () => {
          const { clipboard } = get()
          if (clipboard.objects.length > 0) {
            clipboard.objects.forEach((originalObject) => {
              const pastedObject: WorldObject = {
                ...originalObject,
                id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                position: {
                  x: originalObject.position.x + 2,
                  y: originalObject.position.y,
                  z: originalObject.position.z + 2
                }
              }
              get().addObject(pastedObject)
            })
            
            // Clear clipboard if it was a cut operation
            if (clipboard.operation === 'cut') {
              set((state) => {
                state.clipboard.objects = []
                state.clipboard.operation = null
              })
            }
          }
        },
        
        // History management
        saveToHistory: () => set((state) => {
          const currentState = [...state.worldObjects]
          
          // Remove any states after current index (when undoing then making new changes)
          state.history.states = state.history.states.slice(0, state.history.currentIndex + 1)
          
          // Add new state
          state.history.states.push(currentState)
          state.history.currentIndex++
          
          // Limit history size
          if (state.history.states.length > state.history.maxHistory) {
            state.history.states = state.history.states.slice(-state.history.maxHistory)
            state.history.currentIndex = state.history.states.length - 1
          }
        }),
        
        undo: () => {
          const { history } = get()
          if (history.currentIndex > 0) {
            set((state) => {
              state.history.currentIndex--
              state.worldObjects = [...state.history.states[state.history.currentIndex]]
              state.hasUnsavedChanges = true
              state.builderState.selectedObjectId = null
            })
          }
        },
        
        redo: () => {
          const { history } = get()
          if (history.currentIndex < history.states.length - 1) {
            set((state) => {
              state.history.currentIndex++
              state.worldObjects = [...state.history.states[state.history.currentIndex]]
              state.hasUnsavedChanges = true
              state.builderState.selectedObjectId = null
            })
          }
        },
        
        canUndo: () => get().history.currentIndex > 0,
        canRedo: () => get().history.currentIndex < get().history.states.length - 1,
        
        // World settings
        updateWorldSettings: (settings) => set((state) => {
          Object.assign(state.worldSettings, settings)
          state.hasUnsavedChanges = true
        }),
        
        // Import/Export
        exportWorld: (worldId) => {
          const world = worldId ? get().savedWorlds.find(w => w.id === worldId) : get().currentWorld
          if (world) {
            return JSON.stringify({
              world,
              exportedAt: new Date().toISOString(),
              version: '1.0'
            })
          }
          return ''
        },
        
        importWorld: (data) => {
          try {
            const parsed = JSON.parse(data)
            if (parsed.world && typeof parsed.world === 'object') {
              const importedWorld = {
                ...parsed.world,
                id: `world-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: `${parsed.world.name} (임포트됨)`,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              
              set((state) => {
                state.savedWorlds.push(importedWorld)
              })
              return true
            }
          } catch (error) {
            console.error('Failed to import world:', error)
          }
          return false
        },
        
        // Preferences
        updatePreferences: (preferences) => set((state) => {
          Object.assign(state.preferences, preferences)
        }),
        
        // Cloud sync
        syncWithCloud: async () => {
          try {
            await worldPersistence.manualSync()
            console.log('✅ World data synced to cloud')
          } catch (error) {
            console.error('❌ Failed to sync world data:', error)
          }
        },

        // 마이그레이션 관련 기능
        migrateFromLocalStorage: async (userId: string) => {
          const { MigrationService } = await import('@/core/database/services')
          
          try {
            const result = await MigrationService.migrateWorldsFromLocalStorage(userId)
            
            if (result.migratedWorlds.length > 0) {
              set((state) => {
                state.savedWorlds = result.migratedWorlds
                state.hasUnsavedChanges = false
              })
              console.log(`✅ Migrated ${result.migratedWorlds.length} worlds from localStorage`)
            }

            if (result.errors.length > 0) {
              console.warn('⚠️ Migration completed with errors:', result.errors)
            }

            return result
          } catch (error) {
            console.error('❌ Migration failed:', error)
            throw error
          }
        },

        loadFromCloud: async (userId: string) => {
          const { worldService } = await import('@/core/database/services')
          
          try {
            const cloudWorlds = await worldService.getUserWorlds(userId)
            set((state) => {
              state.savedWorlds = cloudWorlds
              state.hasUnsavedChanges = false
            })
            console.log(`📥 Loaded ${cloudWorlds.length} worlds from cloud`)
            return cloudWorlds
          } catch (error) {
            console.error('❌ Failed to load worlds from cloud:', error)
            throw error
          }
        },
        
        // Utility
        reset: () => set(() => ({ ...initialState }))
      })),
      {
        name: 'world-store',
        storage: worldPersistence,
        partialize: (state) => ({
          savedWorlds: state.savedWorlds,
          selectedWorldId: state.selectedWorldId,
          preferences: state.preferences,
          builderState: {
            ...state.builderState,
            selectedObjectId: null // Don't persist selected object
          }
        })
      }
    ),
    {
      name: 'world-store'
    }
  )
)

// Convenience selectors
export const useCurrentWorld = () => useWorldStore((state) => state.currentWorld)
export const useSavedWorlds = () => useWorldStore((state) => state.savedWorlds)
export const useWorldObjects = () => useWorldStore((state) => state.worldObjects)
export const useBuilderState = () => useWorldStore((state) => state.builderState)
export const useWorldBuilding = () => useWorldStore((state) => ({
  isBuilding: state.isBuilding,
  hasUnsavedChanges: state.hasUnsavedChanges
}))
export const useWorldHistory = () => useWorldStore((state) => ({
  canUndo: state.history.currentIndex > 0,
  canRedo: state.history.currentIndex < state.history.states.length - 1
}))