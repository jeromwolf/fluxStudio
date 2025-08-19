import { useState, useCallback } from 'react'
import { useAuth } from '@/core/auth/hooks'
import { worldService } from '@/core/database/services'
import type { World } from '@/core/database/types'

export interface WorldSharingOptions {
  visibility: 'public' | 'private' | 'friends'
  allowCollaboration?: boolean
  maxCollaborators?: number
}

export interface CollaborationSettings {
  canEdit: boolean
  canAddObjects: boolean
  canDeleteObjects: boolean
  canChangeSettings: boolean
}

export interface SharedWorldInfo {
  id: string
  name: string
  ownerName: string
  shareUrl: string
  qrCode?: string
  permissions: CollaborationSettings
}

export function useWorldSharing() {
  const { user } = useAuth()
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 월드 공유 설정 업데이트
  const shareWorld = useCallback(async (
    worldId: string, 
    options: WorldSharingOptions
  ): Promise<SharedWorldInfo | null> => {
    if (!user?.id) {
      setError('사용자 인증이 필요합니다')
      return null
    }

    setIsSharing(true)
    setError(null)

    try {
      // 월드 가시성 업데이트
      const updatedWorld = await worldService.updateWorld(worldId, user.id, {
        visibility: options.visibility
      })

      if (!updatedWorld) {
        throw new Error('월드를 찾을 수 없습니다')
      }

      const shareInfo: SharedWorldInfo = {
        id: worldId,
        name: updatedWorld.name,
        ownerName: user.name || user.email || 'Unknown',
        shareUrl: `${window.location.origin}/world/${worldId}`,
        permissions: {
          canEdit: options.allowCollaboration || false,
          canAddObjects: options.allowCollaboration || false,
          canDeleteObjects: false, // 소유자만 가능
          canChangeSettings: false // 소유자만 가능
        }
      }

      console.log('🌐 World shared successfully:', shareInfo)
      return shareInfo
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '월드 공유에 실패했습니다'
      setError(errorMsg)
      console.error('❌ Failed to share world:', error)
      return null
    } finally {
      setIsSharing(false)
    }
  }, [user])

  // 월드 공유 중단
  const stopSharing = useCallback(async (worldId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('사용자 인증이 필요합니다')
      return false
    }

    setIsSharing(true)
    setError(null)

    try {
      const updatedWorld = await worldService.updateWorld(worldId, user.id, {
        visibility: 'private'
      })

      if (updatedWorld) {
        console.log('🔒 World sharing stopped:', worldId)
        return true
      }
      return false
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '공유 중단에 실패했습니다'
      setError(errorMsg)
      console.error('❌ Failed to stop sharing:', error)
      return false
    } finally {
      setIsSharing(false)
    }
  }, [user])

  // 공개 월드 목록 가져오기
  const getPublicWorlds = useCallback(async (
    limit = 20, 
    offset = 0
  ): Promise<World[]> => {
    try {
      const publicWorlds = await worldService.getPublicWorlds(limit, offset)
      return publicWorlds
    } catch (error) {
      console.error('❌ Failed to fetch public worlds:', error)
      return []
    }
  }, [])

  // 인기 월드 가져오기
  const getPopularWorlds = useCallback(async (limit = 20): Promise<Array<World & { visitCount: number }>> => {
    try {
      const popularWorlds = await worldService.getPopularWorlds(limit)
      return popularWorlds
    } catch (error) {
      console.error('❌ Failed to fetch popular worlds:', error)
      return []
    }
  }, [])

  // 월드 검색
  const searchWorlds = useCallback(async (query: string): Promise<World[]> => {
    try {
      const results = await worldService.searchWorlds(query)
      return results
    } catch (error) {
      console.error('❌ Failed to search worlds:', error)
      return []
    }
  }, [])

  // 월드 방문 기록
  const visitWorld = useCallback(async (worldId: string, duration = 0) => {
    if (!user?.id) return

    try {
      await worldService.recordVisit(worldId, user.id, duration)
      console.log(`📍 Recorded visit to world ${worldId} (${duration}s)`)
    } catch (error) {
      console.error('❌ Failed to record world visit:', error)
    }
  }, [user])

  // 월드 복제 (공개 월드를 내 계정으로)
  const duplicateWorld = useCallback(async (worldId: string, newName?: string): Promise<World | null> => {
    if (!user?.id) {
      setError('사용자 인증이 필요합니다')
      return null
    }

    try {
      const duplicatedWorld = await worldService.duplicateWorld(worldId, user.id, newName)
      if (duplicatedWorld) {
        console.log('📋 World duplicated successfully:', duplicatedWorld.name)
      }
      return duplicatedWorld
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '월드 복제에 실패했습니다'
      setError(errorMsg)
      console.error('❌ Failed to duplicate world:', error)
      return null
    }
  }, [user])

  // 월드 통계 가져오기
  const getWorldStats = useCallback(async (worldId: string) => {
    try {
      const stats = await worldService.getWorldStats(worldId)
      return stats
    } catch (error) {
      console.error('❌ Failed to fetch world stats:', error)
      return null
    }
  }, [])

  // QR 코드 생성 (클라이언트 사이드)
  const generateQRCode = useCallback(async (shareUrl: string): Promise<string> => {
    try {
      // 간단한 QR 코드 생성 (실제로는 qrcode 라이브러리 사용)
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
      return qrApiUrl
    } catch (error) {
      console.error('❌ Failed to generate QR code:', error)
      return ''
    }
  }, [])

  // 공유 링크 복사
  const copyShareLink = useCallback(async (shareUrl: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      console.log('📋 Share link copied to clipboard')
      return true
    } catch (error) {
      console.error('❌ Failed to copy share link:', error)
      return false
    }
  }, [])

  return {
    // 상태
    isSharing,
    error,

    // 공유 관리
    shareWorld,
    stopSharing,
    copyShareLink,
    generateQRCode,

    // 월드 탐색
    getPublicWorlds,
    getPopularWorlds,
    searchWorlds,
    visitWorld,
    duplicateWorld,
    getWorldStats,

    // 유틸리티
    clearError: () => setError(null)
  }
}