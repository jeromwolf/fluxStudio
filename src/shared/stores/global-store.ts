import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User, Avatar, World } from '@/core/database/types'
import type { AvatarCustomization } from '@/features/avatar/types'
import { globalPersistence } from './persistence'

// Global Application State
export interface GlobalState {
  // User & Authentication
  user: {
    data: User | null
    isAuthenticated: boolean
    isLoading: boolean
  }
  
  // Current Session
  session: {
    currentAvatar: Avatar | null
    currentWorld: World | null
    isOnline: boolean
    latency: number
    serverTime: number
  }
  
  // UI State
  ui: {
    isAvatarCustomizerOpen: boolean
    isWorldBuilderOpen: boolean
    activeModal: string | null
    theme: 'light' | 'dark' | 'auto'
    sidebarCollapsed: boolean
  }
  
  // Multiplayer State
  multiplayer: {
    connectedPlayers: Player[]
    isInWorld: boolean
    worldId: string | null
    roomId: string | null
  }
  
  // Cache for Performance
  cache: {
    avatars: Avatar[]
    worlds: World[]
    lastSync: number
  }
}

// Player in multiplayer session
export interface Player {
  id: string
  username: string
  avatar: AvatarCustomization
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  isMoving: boolean
  lastActivity: number
}

// Actions interface
export interface GlobalActions {
  // User actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setUserLoading: (loading: boolean) => void
  
  // Session actions
  setCurrentAvatar: (avatar: Avatar | null) => void
  setCurrentWorld: (world: World | null) => void
  updateConnectionStatus: (isOnline: boolean, latency?: number) => void
  updateServerTime: (time: number) => void
  
  // UI actions
  openAvatarCustomizer: () => void
  closeAvatarCustomizer: () => void
  openWorldBuilder: () => void
  closeWorldBuilder: () => void
  setActiveModal: (modal: string | null) => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  toggleSidebar: () => void
  
  // Multiplayer actions
  joinWorld: (worldId: string, roomId: string) => void
  leaveWorld: () => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  
  // Cache actions
  setCachedAvatars: (avatars: Avatar[]) => void
  setCachedWorlds: (worlds: World[]) => void
  updateLastSync: () => void
  
  // Utility actions
  reset: () => void
  
  // Auth integration
  initializeFromSession: (user: User) => void
  clearUserData: () => void
}

// Initial state
const initialState: GlobalState = {
  user: {
    data: null,
    isAuthenticated: false,
    isLoading: true
  },
  session: {
    currentAvatar: null,
    currentWorld: null,
    isOnline: false,
    latency: 0,
    serverTime: Date.now()
  },
  ui: {
    isAvatarCustomizerOpen: false,
    isWorldBuilderOpen: false,
    activeModal: null,
    theme: 'auto',
    sidebarCollapsed: false
  },
  multiplayer: {
    connectedPlayers: [],
    isInWorld: false,
    worldId: null,
    roomId: null
  },
  cache: {
    avatars: [],
    worlds: [],
    lastSync: 0
  }
}

// Create the store with middleware
export const useGlobalStore = create<GlobalState & GlobalActions>()(
  devtools(
    persist(
      immer((set, get) => ({
      ...initialState,
      
      // User actions
      setUser: (user) => set((state) => {
        state.user.data = user
        state.user.isAuthenticated = !!user
      }),
      
      setAuthenticated: (authenticated) => set((state) => {
        state.user.isAuthenticated = authenticated
      }),
      
      setUserLoading: (loading) => set((state) => {
        state.user.isLoading = loading
      }),
      
      // Session actions
      setCurrentAvatar: (avatar) => set((state) => {
        state.session.currentAvatar = avatar
      }),
      
      setCurrentWorld: (world) => set((state) => {
        state.session.currentWorld = world
      }),
      
      updateConnectionStatus: (isOnline, latency = 0) => set((state) => {
        state.session.isOnline = isOnline
        if (latency) state.session.latency = latency
      }),
      
      updateServerTime: (time) => set((state) => {
        state.session.serverTime = time
      }),
      
      // UI actions
      openAvatarCustomizer: () => set((state) => {
        state.ui.isAvatarCustomizerOpen = true
        state.ui.isWorldBuilderOpen = false
      }),
      
      closeAvatarCustomizer: () => set((state) => {
        state.ui.isAvatarCustomizerOpen = false
      }),
      
      openWorldBuilder: () => set((state) => {
        state.ui.isWorldBuilderOpen = true
        state.ui.isAvatarCustomizerOpen = false
      }),
      
      closeWorldBuilder: () => set((state) => {
        state.ui.isWorldBuilderOpen = false
      }),
      
      setActiveModal: (modal) => set((state) => {
        state.ui.activeModal = modal
      }),
      
      setTheme: (theme) => set((state) => {
        state.ui.theme = theme
      }),
      
      toggleSidebar: () => set((state) => {
        state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed
      }),
      
      // Multiplayer actions
      joinWorld: (worldId, roomId) => set((state) => {
        state.multiplayer.isInWorld = true
        state.multiplayer.worldId = worldId
        state.multiplayer.roomId = roomId
        state.multiplayer.connectedPlayers = []
      }),
      
      leaveWorld: () => set((state) => {
        state.multiplayer.isInWorld = false
        state.multiplayer.worldId = null
        state.multiplayer.roomId = null
        state.multiplayer.connectedPlayers = []
      }),
      
      addPlayer: (player) => set((state) => {
        const existingIndex = state.multiplayer.connectedPlayers.findIndex(p => p.id === player.id)
        if (existingIndex >= 0) {
          state.multiplayer.connectedPlayers[existingIndex] = player
        } else {
          state.multiplayer.connectedPlayers.push(player)
        }
      }),
      
      removePlayer: (playerId) => set((state) => {
        state.multiplayer.connectedPlayers = state.multiplayer.connectedPlayers.filter(p => p.id !== playerId)
      }),
      
      updatePlayer: (playerId, updates) => set((state) => {
        const player = state.multiplayer.connectedPlayers.find(p => p.id === playerId)
        if (player) {
          Object.assign(player, updates)
        }
      }),
      
      // Cache actions
      setCachedAvatars: (avatars) => set((state) => {
        state.cache.avatars = avatars
        state.cache.lastSync = Date.now()
      }),
      
      setCachedWorlds: (worlds) => set((state) => {
        state.cache.worlds = worlds
        state.cache.lastSync = Date.now()
      }),
      
      updateLastSync: () => set((state) => {
        state.cache.lastSync = Date.now()
      }),
      
      // Utility actions
      reset: () => set(() => ({ ...initialState })),
      
      // Auth integration
      initializeFromSession: (user) => set((state) => {
        state.user.data = user
        state.user.isAuthenticated = true
        state.user.isLoading = false
      }),
      
      clearUserData: () => set((state) => {
        state.user.data = null
        state.user.isAuthenticated = false
        state.user.isLoading = false
        state.session.currentAvatar = null
        state.session.currentWorld = null
        state.cache.avatars = []
        state.cache.worlds = []
      })
    })),
      {
        name: 'global-store',
        storage: globalPersistence,
        partialize: (state) => ({
          ui: state.ui,
          cache: state.cache
        })
      }
    ),
    {
      name: 'flux-studio-store'
    }
  )
)

// Selectors for common state access patterns
export const useUser = () => useGlobalStore((state) => state.user)
export const useSession = () => useGlobalStore((state) => state.session)
export const useUI = () => useGlobalStore((state) => state.ui)
export const useMultiplayer = () => useGlobalStore((state) => state.multiplayer)
export const useCache = () => useGlobalStore((state) => state.cache)