'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useWorldSharing } from '@/shared/hooks/use-world-sharing'
import { useCurrentWorld } from '@/shared/stores/world-store'
import { 
  Share2, 
  Link, 
  QrCode, 
  Globe, 
  Lock, 
  Users, 
  Copy, 
  Check,
  Eye,
  EyeOff
} from 'lucide-react'

interface WorldSharingPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function WorldSharingPanel({ isOpen, onClose }: WorldSharingPanelProps) {
  const currentWorld = useCurrentWorld()
  const sharing = useWorldSharing()
  const [shareInfo, setShareInfo] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>(
    currentWorld?.visibility || 'private'
  )

  useEffect(() => {
    if (currentWorld) {
      setVisibility(currentWorld.visibility)
    }
  }, [currentWorld])

  const handleShare = async () => {
    if (!currentWorld) return

    const info = await sharing.shareWorld(currentWorld.id, {
      visibility,
      allowCollaboration: visibility === 'public'
    })

    if (info) {
      setShareInfo(info)
    }
  }

  const handleStopSharing = async () => {
    if (!currentWorld) return

    const success = await sharing.stopSharing(currentWorld.id)
    if (success) {
      setShareInfo(null)
      setVisibility('private')
    }
  }

  const handleCopyLink = async () => {
    if (!shareInfo) return

    const success = await sharing.copyShareLink(shareInfo.shareUrl)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen || !currentWorld) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              월드 공유
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            {/* 월드 정보 */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium text-gray-900">{currentWorld.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {currentWorld.description || '설명이 없습니다'}
              </p>
            </div>

            {/* 가시성 설정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공유 범위
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="text-blue-600"
                  />
                  <Lock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">비공개</div>
                    <div className="text-xs text-gray-500">나만 볼 수 있습니다</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="visibility"
                    value="friends"
                    checked={visibility === 'friends'}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="text-blue-600"
                  />
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">친구만</div>
                    <div className="text-xs text-gray-500">친구들과 공유</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="text-blue-600"
                  />
                  <Globe className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">공개</div>
                    <div className="text-xs text-gray-500">모든 사람이 볼 수 있습니다</div>
                  </div>
                </label>
              </div>
            </div>

            {/* 공유 링크 정보 */}
            {shareInfo && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Link className="w-4 h-4" />
                  <span className="font-medium">공유 링크</span>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={shareInfo.shareUrl}
                    readOnly
                    className="flex-1 text-sm bg-white"
                  />
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? '복사됨' : '복사'}
                  </Button>
                </div>

                <div className="flex gap-2 text-xs text-blue-600">
                  <span>📊 조회수: 0</span>
                  <span>👥 방문자: 0</span>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {sharing.error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {sharing.error}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-2 pt-4">
              {!shareInfo || currentWorld.visibility === 'private' ? (
                <Button
                  onClick={handleShare}
                  disabled={sharing.isSharing || visibility === 'private'}
                  className="flex-1 flex items-center gap-2"
                >
                  {sharing.isSharing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      공유 중...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      월드 공유하기
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleStopSharing}
                  variant="outline"
                  disabled={sharing.isSharing}
                  className="flex-1 flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  공유 중단
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4"
              >
                닫기
              </Button>
            </div>

            {/* 공유 팁 */}
            {visibility === 'public' && (
              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                💡 <strong>팁:</strong> 공개 월드는 다른 사용자들이 복제하여 자신만의 버전을 만들 수 있습니다.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}