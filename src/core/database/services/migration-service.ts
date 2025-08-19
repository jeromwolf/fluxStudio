import { worldService, avatarService } from './index'
import { WorldStorage, SavedWorld, SavedObject } from '@/lib/storage/world-storage'
import type { AvatarCustomization } from '@/features/avatar/types'
import type { World } from '../types'

export class MigrationService {
  // localStorage에서 Neon DB로 월드 데이터 마이그레이션
  static async migrateWorldsFromLocalStorage(userId: string): Promise<{
    migratedWorlds: World[]
    errors: string[]
  }> {
    const migratedWorlds: World[] = []
    const errors: string[] = []

    try {
      // localStorage에서 월드 데이터 가져오기
      const localWorlds = WorldStorage.getAllWorlds()
      
      if (localWorlds.length === 0) {
        console.log('📦 No worlds found in localStorage to migrate')
        return { migratedWorlds, errors }
      }

      console.log(`🚚 Starting migration of ${localWorlds.length} worlds...`)

      for (const localWorld of localWorlds) {
        try {
          // 월드 데이터 변환
          const worldData = this.transformLocalWorldToDbWorld(localWorld)
          
          // DB에 저장
          const newWorld = await worldService.createWorld(userId, worldData)
          migratedWorlds.push(newWorld)
          
          console.log(`✅ Migrated world: ${localWorld.name}`)
        } catch (error) {
          const errorMsg = `Failed to migrate world "${localWorld.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      }

      // 마이그레이션 성공 시 localStorage 백업 생성
      if (migratedWorlds.length > 0) {
        this.createLocalStorageBackup('worlds')
      }

      console.log(`🎉 Migration completed: ${migratedWorlds.length} worlds migrated, ${errors.length} errors`)
      
    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error(`💥 ${errorMsg}`)
    }

    return { migratedWorlds, errors }
  }

  // localStorage에서 아바타 데이터 마이그레이션 (Zustand 스토어용)
  static async migrateAvatarsFromLocalStorage(userId: string): Promise<{
    migratedAvatars: any[]
    errors: string[]
  }> {
    const migratedAvatars: any[] = []
    const errors: string[] = []

    try {
      // localStorage에서 아바타 스토어 데이터 가져오기
      const avatarStoreData = localStorage.getItem('avatar-store')
      if (!avatarStoreData) {
        console.log('📦 No avatar data found in localStorage to migrate')
        return { migratedAvatars, errors }
      }

      const parsed = JSON.parse(avatarStoreData)
      const localAvatars = parsed.state?.savedAvatars || []

      if (localAvatars.length === 0) {
        console.log('📦 No avatars found in avatar store to migrate')
        return { migratedAvatars, errors }
      }

      console.log(`🚚 Starting migration of ${localAvatars.length} avatars...`)

      for (const localAvatar of localAvatars) {
        try {
          // 아바타 데이터를 DB에 저장
          const newAvatar = await avatarService.createAvatar(userId, localAvatar)
          migratedAvatars.push(newAvatar)
          
          console.log(`✅ Migrated avatar: ${localAvatar.name}`)
        } catch (error) {
          const errorMsg = `Failed to migrate avatar "${localAvatar.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      }

      // 마이그레이션 성공 시 localStorage 백업 생성
      if (migratedAvatars.length > 0) {
        this.createLocalStorageBackup('avatars')
      }

      console.log(`🎉 Avatar migration completed: ${migratedAvatars.length} avatars migrated, ${errors.length} errors`)
      
    } catch (error) {
      const errorMsg = `Avatar migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error(`💥 ${errorMsg}`)
    }

    return { migratedAvatars, errors }
  }

  // localStorage 월드 데이터를 DB 형식으로 변환
  private static transformLocalWorldToDbWorld(localWorld: SavedWorld) {
    return {
      name: localWorld.name,
      description: localWorld.description || '',
      visibility: localWorld.isPublic ? 'public' as const : 'private' as const,
      maxPlayers: 20,
      objects: this.transformLocalObjectsToDbObjects(localWorld.objects),
      settings: {
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
        },
        // 기존 설정 유지
        ...localWorld.settings
      }
    }
  }

  // localStorage 오브젝트를 DB 형식으로 변환
  private static transformLocalObjectsToDbObjects(localObjects: SavedObject[]) {
    return localObjects.map(obj => ({
      id: obj.id,
      type: obj.type,
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
      properties: {
        color: obj.color,
        ...obj.metadata
      },
      state: {},
      metadata: {
        id: obj.id,
        type: obj.type,
        name: obj.type,
        category: 'basic',
        icon: '📦',
        description: `Migrated ${obj.type} object`,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      config: {
        interactions: {
          clickable: true,
          hoverable: true,
          draggable: true,
          selectable: true
        },
        materials: {
          default: obj.color ? { color: obj.color } : {}
        }
      }
    }))
  }

  // localStorage 백업 생성
  private static createLocalStorageBackup(type: 'worlds' | 'avatars') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupKey = `backup_${type}_${timestamp}`
      
      if (type === 'worlds') {
        const worldsData = localStorage.getItem('saved_worlds')
        if (worldsData) {
          localStorage.setItem(backupKey, worldsData)
          console.log(`💾 Created backup: ${backupKey}`)
        }
      } else if (type === 'avatars') {
        const avatarData = localStorage.getItem('avatar-store')
        if (avatarData) {
          localStorage.setItem(backupKey, avatarData)
          console.log(`💾 Created backup: ${backupKey}`)
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to create backup:', error)
    }
  }

  // 사용자별 마이그레이션 상태 확인
  static async checkMigrationStatus(userId: string): Promise<{
    needsWorldMigration: boolean
    needsAvatarMigration: boolean
    localWorldCount: number
    localAvatarCount: number
    cloudWorldCount: number
    cloudAvatarCount: number
  }> {
    try {
      // 로컬 데이터 확인
      const localWorlds = WorldStorage.getAllWorlds()
      
      let localAvatarCount = 0
      try {
        const avatarStoreData = localStorage.getItem('avatar-store')
        if (avatarStoreData) {
          const parsed = JSON.parse(avatarStoreData)
          localAvatarCount = parsed.state?.savedAvatars?.length || 0
        }
      } catch {
        localAvatarCount = 0
      }

      // 클라우드 데이터 확인
      const cloudWorlds = await worldService.getUserWorlds(userId)
      const cloudAvatars = await avatarService.getUserAvatars(userId)

      return {
        needsWorldMigration: localWorlds.length > 0 && cloudWorlds.length === 0,
        needsAvatarMigration: localAvatarCount > 0 && cloudAvatars.length === 0,
        localWorldCount: localWorlds.length,
        localAvatarCount,
        cloudWorldCount: cloudWorlds.length,
        cloudAvatarCount: cloudAvatars.length
      }
    } catch (error) {
      console.error('Failed to check migration status:', error)
      return {
        needsWorldMigration: false,
        needsAvatarMigration: false,
        localWorldCount: 0,
        localAvatarCount: 0,
        cloudWorldCount: 0,
        cloudAvatarCount: 0
      }
    }
  }

  // 전체 마이그레이션 실행
  static async performFullMigration(userId: string): Promise<{
    worldResults: { migratedWorlds: World[]; errors: string[] }
    avatarResults: { migratedAvatars: any[]; errors: string[] }
    success: boolean
  }> {
    console.log('🚀 Starting full migration for user:', userId)

    const worldResults = await this.migrateWorldsFromLocalStorage(userId)
    const avatarResults = await this.migrateAvatarsFromLocalStorage(userId)

    const success = worldResults.errors.length === 0 && avatarResults.errors.length === 0

    if (success) {
      console.log('🎉 Full migration completed successfully!')
    } else {
      console.warn('⚠️ Migration completed with some errors:', {
        worldErrors: worldResults.errors,
        avatarErrors: avatarResults.errors
      })
    }

    return {
      worldResults,
      avatarResults,
      success
    }
  }

  // 마이그레이션 후 정리 작업
  static async cleanupAfterMigration(userId: string, confirmed: boolean = false): Promise<boolean> {
    if (!confirmed) {
      console.warn('⚠️ Cleanup requires explicit confirmation')
      return false
    }

    try {
      // 마이그레이션 상태 재확인
      const status = await this.checkMigrationStatus(userId)
      
      if (status.cloudWorldCount > 0 || status.cloudAvatarCount > 0) {
        // 클라우드에 데이터가 있으면 localStorage 정리
        WorldStorage.clearAllWorlds()
        
        // 아바타 스토어 정리 (백업 후)
        this.createLocalStorageBackup('avatars')
        const avatarStore = localStorage.getItem('avatar-store')
        if (avatarStore) {
          const parsed = JSON.parse(avatarStore)
          if (parsed.state) {
            parsed.state.savedAvatars = []
            localStorage.setItem('avatar-store', JSON.stringify(parsed))
          }
        }
        
        console.log('🧹 Cleanup completed - localStorage cleared after successful migration')
        return true
      } else {
        console.warn('⚠️ Cleanup aborted - no cloud data found')
        return false
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error)
      return false
    }
  }
}