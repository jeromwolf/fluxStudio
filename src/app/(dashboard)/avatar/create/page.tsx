'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAvatarStore } from '@/shared/stores/avatar-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, ChevronLeft, Save } from 'lucide-react'
import { AvatarCustomizer } from '@/features/avatar/components/AvatarCustomizer'
import type { AvatarCustomization } from '@/features/avatar/types'

export default function CreateAvatarPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [avatarName, setAvatarName] = useState('')
  const [avatarConfig, setAvatarConfig] = useState<AvatarCustomization>({
    id: '',
    name: '',
    type: 'humanoid',
    body: {
      type: 'average',
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
  })
  
  const saveAvatar = useAvatarStore((state) => state.saveAvatar)
  const startCustomizing = useAvatarStore((state) => state.startCustomizing)

  const handleNameSubmit = () => {
    if (avatarName.trim()) {
      startCustomizing()
      setStep(2)
    }
  }

  const handleAvatarSave = () => {
    // Save to store with name
    const newAvatar = {
      id: `avatar-${Date.now()}`,
      ...avatarConfig,
      name: avatarName,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    saveAvatar(newAvatar as any)
    
    // Navigate to avatar list
    router.push('/avatar')
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push('/avatar')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                뒤로
              </Button>
              <h1 className="text-2xl font-bold">새 아바타 만들기</h1>
            </div>
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={step === 1 ? "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8" : "w-full px-4 sm:px-6 lg:px-8 pb-8"}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: 아바타 이름 정하기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="avatar-name">아바타 이름</Label>
                  <Input
                    id="avatar-name"
                    type="text"
                    placeholder="예: 일상용 아바타, 파티용 아바타"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    나중에 변경할 수 있습니다
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleNameSubmit}
                    disabled={!avatarName.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    다음 단계
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Step 2: 아바타 꾸미기</h2>
              <p className="text-sm text-gray-600 mt-1">
                {avatarName}의 외형을 커스터마이징하세요
              </p>
            </div>
            <AvatarCustomizer 
              avatar={avatarConfig}
              onAvatarChange={setAvatarConfig}
              onSave={handleAvatarSave}
              onCancel={() => router.push('/avatar')}
            />
          </div>
        )}
      </div>
    </div>
  )
}