'use client'

import { useState } from 'react'
import { AvatarCustomizer, AvatarConfig } from '@/components/avatar/AvatarCustomizer'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function AvatarEditorPage() {
  const router = useRouter()
  const [savedConfig, setSavedConfig] = useState<AvatarConfig | null>(null)

  const handleSave = (config: AvatarConfig) => {
    // Save to localStorage for now
    localStorage.setItem('avatarConfig', JSON.stringify(config))
    setSavedConfig(config)
    
    // Show success message
    setTimeout(() => {
      alert('Avatar saved successfully!')
    }, 100)
  }

  const handleGoToMetaverse = () => {
    router.push('/metaverse')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Avatar Editor</h1>
          <p className="text-gray-600">Create your unique metaverse identity</p>
        </div>

        <AvatarCustomizer onSave={handleSave} />

        {savedConfig && (
          <div className="mt-8 text-center">
            <Button 
              onClick={handleGoToMetaverse}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Enter Metaverse with New Avatar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}