'use client'

import { useState, useEffect } from 'react'
import { AvatarCustomizer } from '@/features/avatar/components/AvatarCustomizer'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAvatarStore } from '@/shared/stores/avatar-store'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, User, ChevronRight, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AvatarCustomization } from '@/features/avatar/types'

export default function AvatarEditorPage() {
  const router = useRouter()
  const [savedConfig, setSavedConfig] = useState<AvatarCustomization | null>(null)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
  
  const savedAvatars = useAvatarStore((state) => state.savedAvatars)
  const currentAvatar = useAvatarStore((state) => state.currentAvatar)
  const selectAvatar = useAvatarStore((state) => state.selectAvatar)
  const saveAvatar = useAvatarStore((state) => state.saveAvatar)
  const startCustomizing = useAvatarStore((state) => state.startCustomizing)
  
  useEffect(() => {
    // Load saved avatars on mount
    const loadSavedAvatars = async () => {
      // Avatars are already loaded from store
      if (savedAvatars.length === 0) {
        // Create a default avatar if none exist
        startCustomizing()
      }
    }
    loadSavedAvatars()
  }, [])

  const handleSave = (config: AvatarCustomization) => {
    // Save to avatar store
    if (currentAvatar) {
      saveAvatar({
        ...currentAvatar,
        ...config
      })
      setSavedConfig(config)
      
      // Show success message
      setTimeout(() => {
        alert('Avatar saved successfully!')
      }, 100)
    }
  }
  
  const handleSelectAvatar = (avatarId: string) => {
    selectAvatar(avatarId)
    setSelectedAvatarId(avatarId)
    startCustomizing(avatarId)
  }

  const handleGoToMetaverse = () => {
    router.push('/metaverse')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
              >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                돌아가기
              </Button>
              <h1 className="text-2xl font-bold">아바타 편집기</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/avatar')}
              >
                <User className="h-4 w-4 mr-1" />
                내 아바타 목록
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* Saved Avatars Section */}
        {savedAvatars.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">저장된 아바타</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {savedAvatars.map((avatar) => (
                <Card 
                  key={avatar.id}
                  className={cn(
                    "cursor-pointer hover:shadow-lg transition-shadow",
                    selectedAvatarId === avatar.id && "ring-2 ring-purple-600"
                  )}
                  onClick={() => handleSelectAvatar(avatar.id)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                    <p className="font-medium text-center">{avatar.name}</p>
                  </CardContent>
                </Card>
              ))}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-dashed"
                onClick={() => startCustomizing()}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                  <PlusCircle className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600">새 아바타</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Avatar Customizer */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <AvatarCustomizer 
            avatar={currentAvatar || {
              id: '',
              name: 'New Avatar',
              type: 'humanoid',
              body: {
                type: 'normal',
                height: 1.0,
                skinColor: '#FDBCB4'
              },
              face: {
                shape: 'oval',
                eyes: { type: 'normal', color: '#8B4513', lashes: false },
                eyebrows: { type: 'normal', color: '#000000' },
                nose: { type: 'normal' },
                mouth: { type: 'normal', lipColor: '#E4967A' },
                makeup: { blush: false, eyeshadow: false, lipstick: false }
              },
              hair: {
                style: 'short',
                color: '#000000'
              },
              clothing: {
                top: { id: '', name: '', type: '', style: '', color: '' },
                bottom: { id: '', name: '', type: '', style: '', color: '' },
                shoes: { id: '', name: '', type: '', style: '', color: '' }
              },
              accessories: {},
              animations: {
                idle: { id: 'idle', name: 'Idle', speed: 1, loop: true },
                walk: { id: 'walk', name: 'Walk', speed: 1, loop: true },
                run: { id: 'run', name: 'Run', speed: 1, loop: true },
                emotes: []
              }
            }}
            onAvatarChange={(newAvatar) => {
              // Update temporary state while editing
              setSavedConfig(newAvatar)
            }}
            onSave={() => {
              if (savedConfig) {
                handleSave(savedConfig)
              }
            }}
            onCancel={() => {
              setSavedConfig(null)
              router.push('/avatar')
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          {savedConfig && (
            <Button 
              onClick={handleGoToMetaverse}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              이 아바타로 메타버스 입장
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}