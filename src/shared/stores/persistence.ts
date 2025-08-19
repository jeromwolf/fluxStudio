import { PersistStorage, StorageValue } from 'zustand/middleware'
import type { Avatar, World } from '@/core/database/types'

// 타입 정의
export interface CloudSyncState {
  lastSync: number
  isSyncing: boolean
  hasCloudData: boolean
  syncErrors: string[]
}

export interface PersistenceConfig {
  enableCloudSync: boolean
  syncInterval: number // milliseconds
  retryAttempts: number
  offlineMode: boolean
}

// 현재 사용자 ID를 가져오는 함수 (전역 상태에서)
let getCurrentUserId = (): string | null => 'temp-user' // 기본값

export const setCurrentUserIdProvider = (provider: () => string | null) => {
  getCurrentUserId = provider
}

// Neon DB 기반 영속성 스토리지
export class CloudPersistStorage<T> implements PersistStorage<T> {
  private storeName: string
  private syncState: CloudSyncState = {
    lastSync: 0,
    isSyncing: false,
    hasCloudData: false,
    syncErrors: []
  }
  private config: PersistenceConfig = {
    enableCloudSync: true,
    syncInterval: 5 * 60 * 1000, // 5분
    retryAttempts: 3,
    offlineMode: false
  }

  constructor(storeName: string, config?: Partial<PersistenceConfig>) {
    this.storeName = storeName
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  // localStorage에서 데이터 가져오기 (즉시 로딩)
  getItem = (name: string): StorageValue<T> | null => {
    try {
      // 브라우저 환경 체크
      if (typeof window === 'undefined') {
        return null
      }
      const item = localStorage.getItem(`${this.storeName}-${name}`)
      return item as StorageValue<T>
    } catch (error) {
      console.error(`Failed to read from localStorage:`, error)
      return null
    }
  }

  // localStorage에 데이터 저장 (즉시 저장)
  setItem = (name: string, value: StorageValue<T>): void => {
    try {
      // 브라우저 환경 체크
      if (typeof window === 'undefined') {
        return
      }
      localStorage.setItem(`${this.storeName}-${name}`, value as string)
      // 클라우드 동기화가 활성화된 경우 백그라운드에서 동기화
      if (this.config.enableCloudSync && !this.config.offlineMode) {
        this.scheduleCloudSync()
      }
    } catch (error) {
      console.error(`Failed to write to localStorage:`, error)
    }
  }

  // localStorage에서 데이터 삭제
  removeItem = (name: string): void => {
    try {
      // 브라우저 환경 체크
      if (typeof window === 'undefined') {
        return
      }
      localStorage.removeItem(`${this.storeName}-${name}`)
    } catch (error) {
      console.error(`Failed to remove from localStorage:`, error)
    }
  }

  // 클라우드 동기화 스케줄링 (디바운싱)
  private syncTimeout: NodeJS.Timeout | null = null
  private scheduleCloudSync = () => {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
    }
    
    this.syncTimeout = setTimeout(() => {
      this.syncToCloud()
    }, 2000) // 2초 후 동기화
  }

  // 클라우드로 데이터 동기화
  private syncToCloud = async () => {
    if (this.syncState.isSyncing) return
    
    this.syncState.isSyncing = true
    this.syncState.syncErrors = []

    try {
      const localData = this.getItem('state')
      if (!localData) return

      const parsedData = JSON.parse(localData)
      
      // 스토어 타입에 따라 다른 서비스 사용
      if (this.storeName === 'avatar-store') {
        await this.syncAvatarData(parsedData)
      } else if (this.storeName === 'world-store') {
        await this.syncWorldData(parsedData)
      }

      this.syncState.lastSync = Date.now()
      this.syncState.hasCloudData = true
      
      console.log(`✅ ${this.storeName} synced to cloud successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.syncState.syncErrors.push(errorMessage)
      console.error(`❌ Failed to sync ${this.storeName} to cloud:`, error)
    } finally {
      this.syncState.isSyncing = false
    }
  }

  // 아바타 데이터 동기화
  private syncAvatarData = async (data: any) => {
    if (!data.savedAvatars || !Array.isArray(data.savedAvatars)) return

    const userId = getCurrentUserId()
    if (!userId) return

    for (const avatarData of data.savedAvatars) {
      try {
        // TODO: Implement API call for avatar sync
        // const existingAvatar = await fetch(`/api/avatars/${avatarData.id}`)
        // API routes need to be implemented
        console.log('Avatar sync disabled - needs API routes')
      } catch (error) {
        console.error(`Failed to sync avatar ${avatarData.id}:`, error)
      }
    }
  }

  // 월드 데이터 동기화
  private syncWorldData = async (data: any) => {
    if (!data.savedWorlds || !Array.isArray(data.savedWorlds)) return

    const userId = getCurrentUserId()
    if (!userId) return

    for (const worldData of data.savedWorlds) {
      try {
        // TODO: Implement API call for world sync
        // const existingWorld = await fetch(`/api/worlds/${worldData.id}`)
        // API routes need to be implemented
        console.log('World sync disabled - needs API routes')
      } catch (error) {
        console.error(`Failed to sync world ${worldData.id}:`, error)
      }
    }
  }

  // 클라우드에서 데이터 로드
  loadFromCloud = async (): Promise<T | null> => {
    try {
      this.syncState.isSyncing = true

      const userId = getCurrentUserId()
      if (!userId) return null

      if (this.storeName === 'avatar-store') {
        // TODO: Implement API call for loading avatars
        // const response = await fetch(`/api/users/${userId}/avatars`)
        // const avatars = await response.json()
        console.log('Avatar loading disabled - needs API routes')
        return null
      } else if (this.storeName === 'world-store') {
        // TODO: Implement API call for loading worlds
        // const response = await fetch(`/api/users/${userId}/worlds`)
        // const worlds = await response.json()
        console.log('World loading disabled - needs API routes')
        return null
      }

      return null
    } catch (error) {
      console.error(`Failed to load ${this.storeName} from cloud:`, error)
      return null
    } finally {
      this.syncState.isSyncing = false
    }
  }

  // 클라우드 아바타 데이터를 스토어 형식으로 변환
  private transformAvatarCloudData = (avatars: Avatar[]) => {
    return {
      savedAvatars: avatars.map(avatar => avatar.metadata),
      selectedAvatarId: avatars.find(a => a.isDefault)?.id || null,
      preferences: {
        defaultAvatarType: 'humanoid',
        autoSave: true,
        showPreviewInWorld: true
      },
      fluxCoins: 1000,
      unlockedItems: {
        clothing: ['tshirt-1', 'jeans-1', 'sneakers-1'],
        accessories: [],
        effects: [],
        presets: []
      }
    }
  }

  // 클라우드 월드 데이터를 스토어 형식으로 변환
  private transformWorldCloudData = (worlds: World[]) => {
    return {
      savedWorlds: worlds,
      selectedWorldId: null,
      preferences: {
        defaultTheme: 'default',
        autoSave: true,
        showObjectNames: true,
        renderDistance: 100
      },
      builderState: {
        mode: 'build',
        selectedObjectId: null,
        selectedObjectType: null,
        isGridVisible: true,
        snapToGrid: true,
        gridSize: 1
      }
    }
  }

  // 동기화 상태 반환
  getSyncState = (): CloudSyncState => ({ ...this.syncState })

  // 수동 동기화 트리거
  manualSync = async (): Promise<void> => {
    await this.syncToCloud()
  }

  // 오프라인 모드 토글
  setOfflineMode = (offline: boolean): void => {
    this.config.offlineMode = offline
  }

  // 동기화 설정 업데이트
  updateConfig = (config: Partial<PersistenceConfig>): void => {
    this.config = { ...this.config, ...config }
  }
}

// 스토어별 영속성 인스턴스 생성
export const avatarPersistence = new CloudPersistStorage<any>('avatar-store', {
  enableCloudSync: true,
  syncInterval: 3 * 60 * 1000, // 3분
  retryAttempts: 2
})

export const worldPersistence = new CloudPersistStorage<any>('world-store', {
  enableCloudSync: true,
  syncInterval: 5 * 60 * 1000, // 5분
  retryAttempts: 3
})

export const globalPersistence = new CloudPersistStorage<any>('global-store', {
  enableCloudSync: false, // 글로벌 상태는 클라우드 동기화 비활성화
  syncInterval: 0,
  retryAttempts: 0
})

// 편의 함수들
export const syncAllStores = async (): Promise<void> => {
  console.log('🔄 Starting full cloud sync...')
  await Promise.all([
    avatarPersistence.manualSync(),
    worldPersistence.manualSync()
  ])
  console.log('✅ Full cloud sync completed')
}

export const enableOfflineMode = (): void => {
  avatarPersistence.setOfflineMode(true)
  worldPersistence.setOfflineMode(true)
  console.log('📴 Offline mode enabled')
}

export const disableOfflineMode = (): void => {
  avatarPersistence.setOfflineMode(false)
  worldPersistence.setOfflineMode(false)
  console.log('🌐 Online mode enabled')
}

// 네트워크 상태 감지 및 자동 모드 전환
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    disableOfflineMode()
    syncAllStores()
  })
  
  window.addEventListener('offline', () => {
    enableOfflineMode()
  })
}