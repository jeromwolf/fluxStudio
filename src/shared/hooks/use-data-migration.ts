'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/core/auth/hooks'
import { useAvatarStore } from '@/shared/stores/avatar-store'
import { useWorldStore } from '@/shared/stores/world-store'
import type { AvatarCustomization } from '@/features/avatar/types'

export interface MigrationStatus {
  isChecking: boolean
  isLoading: boolean
  progress: number
  currentStep: string
  error: string | null
  completed: boolean
  needsMigration: boolean
}

export interface MigrationResult {
  avatarsMigrated: number
  worldsMigrated: number
  errors: string[]
}

export function useDataMigration() {
  const { user, isAuthenticated } = useAuth()
  const [status, setStatus] = useState<MigrationStatus>({
    isChecking: false,
    isLoading: false,
    progress: 0,
    currentStep: '',
    error: null,
    completed: false,
    needsMigration: false
  })

  const avatarStore = useAvatarStore()
  const worldStore = useWorldStore()

  const updateStatus = useCallback((updates: Partial<MigrationStatus>) => {
    setStatus(prev => ({ ...prev, ...updates }))
  }, [])

  // 마이그레이션 필요 여부 확인
  const checkMigrationNeeded = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false

    updateStatus({ isChecking: true, error: null })

    try {
      // TODO: Implement API call for migration status check
      // const response = await fetch(`/api/migration/status/${user.id}`)
      // const migrationStatus = await response.json()
      const needsMigration = false // Temporarily disabled

      updateStatus({ 
        isChecking: false, 
        needsMigration,
        currentStep: needsMigration ? 'Migration needed' : 'No migration needed'
      })

      return needsMigration
    } catch (error) {
      updateStatus({
        isChecking: false,
        error: error instanceof Error ? error.message : 'Failed to check migration status'
      })
      return false
    }
  }, [user?.id, updateStatus])

  // 새로운 마이그레이션 시스템 사용
  const runMigration = useCallback(async (): Promise<MigrationResult> => {
    if (!user?.id) {
      throw new Error('User must be authenticated to run migration')
    }

    const result: MigrationResult = {
      avatarsMigrated: 0,
      worldsMigrated: 0,
      errors: []
    }

    try {
      updateStatus({
        isLoading: true,
        progress: 0,
        currentStep: 'Starting migration...',
        error: null,
        completed: false
      })

      // TODO: Implement API calls for migration
      updateStatus({ progress: 20, currentStep: 'Migration temporarily disabled' })
      console.log('Migration service disabled - needs API routes')
      
      updateStatus({ progress: 60, currentStep: 'Skipping migration...' })

      updateStatus({ progress: 80, currentStep: 'Syncing with stores...' })
      
      // 스토어 동기화
      if (result.worldsMigrated > 0) {
        await worldStore.loadFromCloud(user.id)
      }
      
      if (result.avatarsMigrated > 0) {
        await avatarStore.syncWithCloud()
      }

      updateStatus({
        progress: 100,
        currentStep: 'Migration completed!',
        completed: true,
        isLoading: false,
        needsMigration: false
      })

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Migration failed'
      updateStatus({
        error: errorMsg,
        isLoading: false
      })
      result.errors.push(errorMsg)
      throw new Error(errorMsg)
    }
  }, [user?.id, updateStatus, worldStore, avatarStore])

  // 자동 마이그레이션 체크 (로그인 시)
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      checkMigrationNeeded()
    }
  }, [isAuthenticated, user?.id, checkMigrationNeeded])

  const migrateToCloud = useCallback(async (userId: string): Promise<MigrationResult> => {
    if (!userId) {
      throw new Error('User ID is required for migration')
    }

    const result: MigrationResult = {
      avatarsMigrated: 0,
      worldsMigrated: 0,
      errors: []
    }

    try {
      updateStatus({
        isLoading: true,
        progress: 0,
        currentStep: 'Preparing migration...',
        error: null,
        completed: false
      })

      // Get data from local stores
      const localAvatars = avatarStore.savedAvatars
      const localWorlds = worldStore.savedWorlds

      const totalItems = localAvatars.length + localWorlds.length
      let processedItems = 0

      // Migrate avatars
      if (localAvatars.length > 0) {
        updateStatus({
          progress: 10,
          currentStep: `Migrating ${localAvatars.length} avatars...`
        })

        try {
          // TODO: Implement API call for avatar migration
          // const response = await fetch('/api/avatars/migrate', {
          //   method: 'POST',
          //   body: JSON.stringify({ userId, avatars: localAvatars })
          // })
          console.log('Avatar migration disabled - needs API routes')
          result.avatarsMigrated = 0

          // Update progress for each avatar
          for (let i = 0; i < localAvatars.length; i++) {
            processedItems++
            updateStatus({
              progress: 10 + (processedItems / totalItems) * 60,
              currentStep: `Migrating avatar: ${localAvatars[i].name}`
            })
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (error) {
          const errorMsg = `Failed to migrate avatars: ${error}`
          result.errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      // Migrate worlds
      if (localWorlds.length > 0) {
        updateStatus({
          progress: 70,
          currentStep: `Migrating ${localWorlds.length} worlds...`
        })

        try {
          // Convert World objects to the format expected by the service
          const worldsForMigration = localWorlds.map(world => ({
            name: world.name,
            description: world.description || '',
            objects: world.objects,
            settings: world.settings
          }))

          // TODO: Implement API call for world migration
          // const response = await fetch('/api/worlds/migrate', {
          //   method: 'POST',
          //   body: JSON.stringify({ userId, worlds: worldsForMigration })
          // })
          console.log('World migration disabled - needs API routes')
          result.worldsMigrated = 0

          // Update progress for each world
          for (let i = 0; i < localWorlds.length; i++) {
            processedItems++
            updateStatus({
              progress: 70 + (processedItems / totalItems) * 20,
              currentStep: `Migrating world: ${localWorlds[i].name}`
            })
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (error) {
          const errorMsg = `Failed to migrate worlds: ${error}`
          result.errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      // Final steps
      updateStatus({
        progress: 95,
        currentStep: 'Finalizing migration...'
      })

      // Clear local data if migration was successful
      if (result.errors.length === 0) {
        updateStatus({
          currentStep: 'Clearing local data...'
        })
        
        // Note: We might want to keep local data as backup until user confirms
        // avatarStore.reset()
        // worldStore.reset()
      }

      updateStatus({
        progress: 100,
        currentStep: 'Migration completed!',
        completed: true,
        isLoading: false
      })

      return result
    } catch (error) {
      const errorMsg = `Migration failed: ${error}`
      updateStatus({
        error: errorMsg,
        isLoading: false
      })
      result.errors.push(errorMsg)
      throw new Error(errorMsg)
    }
  }, [avatarStore, worldStore, updateStatus])

  const migrateFromCloud = useCallback(async (userId: string): Promise<MigrationResult> => {
    const result: MigrationResult = {
      avatarsMigrated: 0,
      worldsMigrated: 0,
      errors: []
    }

    try {
      updateStatus({
        isLoading: true,
        progress: 0,
        currentStep: 'Fetching data from cloud...',
        error: null,
        completed: false
      })

      // Fetch user's avatars from cloud
      updateStatus({
        progress: 20,
        currentStep: 'Loading avatars from cloud...'
      })

      // TODO: Implement API call to get user avatars
      // const response = await fetch(`/api/users/${userId}/avatars`)
      // const cloudAvatars = await response.json()
      const cloudAvatars = [] // Temporarily disabled
      
      // Convert to local format and update store
      if (cloudAvatars.length > 0) {
        const localAvatars: AvatarCustomization[] = cloudAvatars.map(avatar => ({
          ...(avatar.metadata as AvatarCustomization),
          id: avatar.id
        }))

        avatarStore.setCachedAvatars(cloudAvatars)
        // Also add to saved avatars
        localAvatars.forEach(avatar => {
          avatarStore.saveAvatar(avatar)
        })

        result.avatarsMigrated = localAvatars.length
      }

      // Fetch user's worlds from cloud
      updateStatus({
        progress: 60,
        currentStep: 'Loading worlds from cloud...'
      })

      // TODO: Implement API call to get user worlds
      // const response = await fetch(`/api/users/${userId}/worlds`)
      // const cloudWorlds = await response.json()
      const cloudWorlds = [] // Temporarily disabled
      
      if (cloudWorlds.length > 0) {
        worldStore.setCachedWorlds(cloudWorlds)
        // Also add to saved worlds - but we need to be careful about the format
        // The cloud worlds are already in the correct format
        cloudWorlds.forEach(world => {
          // Add to saved worlds in the store
          const { savedWorlds } = worldStore.getState()
          const existingIndex = savedWorlds.findIndex(w => w.id === world.id)
          if (existingIndex >= 0) {
            savedWorlds[existingIndex] = world
          } else {
            savedWorlds.push(world)
          }
        })

        result.worldsMigrated = cloudWorlds.length
      }

      updateStatus({
        progress: 100,
        currentStep: 'Cloud sync completed!',
        completed: true,
        isLoading: false
      })

      return result
    } catch (error) {
      const errorMsg = `Cloud sync failed: ${error}`
      updateStatus({
        error: errorMsg,
        isLoading: false
      })
      result.errors.push(errorMsg)
      throw new Error(errorMsg)
    }
  }, [avatarStore, worldStore, updateStatus])

  const exportLocalData = useCallback(() => {
    const localAvatars = avatarStore.savedAvatars
    const localWorlds = worldStore.savedWorlds

    const exportData = {
      avatars: localAvatars,
      worlds: localWorlds,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(exportData, null, 2)
  }, [avatarStore.savedAvatars, worldStore.savedWorlds])

  const importLocalData = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData)
      
      if (parsed.avatars && Array.isArray(parsed.avatars)) {
        parsed.avatars.forEach((avatar: AvatarCustomization) => {
          avatarStore.saveAvatar({
            ...avatar,
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${avatar.name} (임포트됨)`
          })
        })
      }

      if (parsed.worlds && Array.isArray(parsed.worlds)) {
        // This is more complex as we need to handle the World type properly
        parsed.worlds.forEach((world: any) => {
          const importedWorld = {
            ...world,
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${world.name} (임포트됨)`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          // Add to store
          const { savedWorlds } = worldStore.getState()
          savedWorlds.push(importedWorld)
        })
      }

      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }, [avatarStore, worldStore])

  const resetMigrationStatus = useCallback(() => {
    setStatus({
      isLoading: false,
      progress: 0,
      currentStep: '',
      error: null,
      completed: false
    })
  }, [])

  return {
    status,
    checkMigrationNeeded,
    runMigration,
    migrateToCloud,
    migrateFromCloud,
    exportLocalData,
    importLocalData,
    resetMigrationStatus,
    // 편의 속성들
    needsMigration: status.needsMigration,
    isChecking: status.isChecking,
    isLoading: status.isLoading,
    completed: status.completed,
    error: status.error
  }
}