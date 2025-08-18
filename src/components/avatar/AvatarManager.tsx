'use client'

import React, { useState, useEffect } from 'react'
import { AvatarCustomizer, AvatarConfig } from './AvatarCustomizer'
import { SaveLoadPanel } from '@/components/ui/save-load-panel'
import { AvatarStorage, SavedAvatar } from '@/lib/storage/avatar-storage'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Users, Plus } from 'lucide-react'

interface AvatarManagerProps {
  onSelectAvatar?: (avatar: SavedAvatar) => void
  className?: string
}

export function AvatarManager({ onSelectAvatar, className }: AvatarManagerProps) {
  const [avatars, setAvatars] = useState<SavedAvatar[]>([])
  const [currentAvatar, setCurrentAvatar] = useState<SavedAvatar | null>(null)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [editingAvatar, setEditingAvatar] = useState<SavedAvatar | null>(null)

  useEffect(() => {
    loadAvatars()
    const current = AvatarStorage.getCurrentAvatar()
    setCurrentAvatar(current)
  }, [])

  const loadAvatars = () => {
    setAvatars(AvatarStorage.getAllAvatars())
  }

  const handleSaveAvatar = (name: string, config: AvatarConfig) => {
    const avatarConfig = {
      color: config.bodyColor,
      shape: config.headShape as 'sphere' | 'box' | 'cone' | 'cylinder',
      bodyType: config.bodyShape,
      accessories: {
        hat: config.accessory === 'hat',
        glasses: config.accessory === 'glasses',
        wings: false,
        tail: false
      }
    }

    let saved: SavedAvatar | null = null
    
    if (editingAvatar) {
      saved = AvatarStorage.updateAvatar(editingAvatar.id, {
        name,
        config: avatarConfig
      })
    } else {
      saved = AvatarStorage.saveAvatar(name, avatarConfig)
    }

    if (saved) {
      loadAvatars()
      setShowCustomizer(false)
      setEditingAvatar(null)
      
      // Auto-select the newly saved avatar
      handleLoadAvatar(saved.id)
    }
  }

  const handleLoadAvatar = (id: string) => {
    const avatar = AvatarStorage.getAvatar(id)
    if (avatar) {
      AvatarStorage.setCurrentAvatar(id)
      setCurrentAvatar(avatar)
      
      // Save to localStorage for compatibility with existing system
      localStorage.setItem('avatarConfig', JSON.stringify(avatar.config))
      
      if (onSelectAvatar) {
        onSelectAvatar(avatar)
      }
    }
  }

  const handleDeleteAvatar = (id: string) => {
    if (AvatarStorage.deleteAvatar(id)) {
      loadAvatars()
      if (currentAvatar?.id === id) {
        setCurrentAvatar(null)
      }
    }
  }

  const handleExportAvatar = (id: string) => {
    const json = AvatarStorage.exportAvatar(id)
    if (json) {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `avatar_${id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImportAvatar = async (file: File) => {
    try {
      const text = await file.text()
      const imported = AvatarStorage.importAvatar(text)
      if (imported) {
        loadAvatars()
      }
    } catch (error) {
      console.error('Failed to import avatar:', error)
    }
  }

  const convertConfigForCustomizer = (avatar: SavedAvatar): AvatarConfig => {
    const accessory = avatar.config.accessories.hat ? 'hat' :
                     avatar.config.accessories.glasses ? 'glasses' :
                     'none'
    
    return {
      bodyColor: avatar.config.color,
      headShape: avatar.config.shape as 'sphere' | 'box' | 'capsule',
      bodyShape: avatar.config.bodyType,
      accessory: accessory as 'none' | 'hat' | 'glasses' | 'crown'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Avatar Manager
        </h2>
        <Button
          onClick={() => {
            setEditingAvatar(null)
            setShowCustomizer(true)
          }}
          className="neu-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Avatar
        </Button>
      </div>

      {/* Current Avatar Display */}
      {currentAvatar && (
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-2">Current Avatar</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full" style={{ backgroundColor: currentAvatar.config.color }} />
            <div>
              <p className="font-medium">{currentAvatar.name}</p>
              <p className="text-sm text-gray-500">
                Shape: {currentAvatar.config.shape} • Body: {currentAvatar.config.bodyType}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingAvatar(currentAvatar)
                setShowCustomizer(true)
              }}
              className="ml-auto"
            >
              Edit
            </Button>
          </div>
        </div>
      )}

      {/* Avatar Customizer */}
      {showCustomizer && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingAvatar ? `Edit ${editingAvatar.name}` : 'Create New Avatar'}
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowCustomizer(false)
                setEditingAvatar(null)
              }}
            >
              Cancel
            </Button>
          </div>
          
          <AvatarCustomizer
            initialConfig={editingAvatar ? convertConfigForCustomizer(editingAvatar) : undefined}
            onSave={(config) => {
              const name = editingAvatar?.name || prompt('Enter avatar name:') || 'My Avatar'
              handleSaveAvatar(name, config)
            }}
          />
        </div>
      )}

      {/* Saved Avatars List */}
      {!showCustomizer && (
        <SaveLoadPanel
          type="avatar"
          items={avatars}
          onSave={(name) => {
            // This would be called from within the customizer
            setShowCustomizer(true)
          }}
          onLoad={handleLoadAvatar}
          onExport={handleExportAvatar}
          onImport={handleImportAvatar}
          onDelete={handleDeleteAvatar}
        />
      )}
    </div>
  )
}