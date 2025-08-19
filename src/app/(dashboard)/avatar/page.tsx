'use client'

import { useRouter } from 'next/navigation'
import { useAvatarStore } from '@/shared/stores/avatar-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, PlusCircle, Edit3, Trash2, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function AvatarListPage() {
  const router = useRouter()
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
  
  const savedAvatars = useAvatarStore((state) => state.savedAvatars)
  const currentAvatar = useAvatarStore((state) => state.currentAvatar)
  const selectAvatar = useAvatarStore((state) => state.selectAvatar)
  const deleteAvatar = useAvatarStore((state) => state.deleteAvatar)
  const duplicateAvatar = useAvatarStore((state) => state.duplicateAvatar)

  const handleSelectAvatar = (avatarId: string) => {
    selectAvatar(avatarId)
    setSelectedAvatarId(avatarId)
  }

  const handleEditAvatar = (avatarId: string) => {
    selectAvatar(avatarId)
    router.push('/avatar-editor')
  }

  const handleDeleteAvatar = (avatarId: string) => {
    if (confirm('이 아바타를 삭제하시겠습니까?')) {
      deleteAvatar(avatarId)
    }
  }

  const handleDuplicateAvatar = (avatarId: string) => {
    const newAvatar = duplicateAvatar(avatarId)
    if (newAvatar) {
      router.push('/avatar-editor')
    }
  }

  const handleCreateNewAvatar = () => {
    router.push('/avatar/create')
  }

  const handleUseAvatar = () => {
    if (selectedAvatarId) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
              >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                돌아가기
              </Button>
              <h1 className="text-2xl font-bold">내 아바타 컬렉션</h1>
            </div>
            <Button 
              onClick={handleCreateNewAvatar}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              새 아바타 만들기
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Avatar Grid */}
        {savedAvatars.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">아직 아바타가 없습니다</h3>
                <p className="text-gray-600 mt-2">첫 번째 아바타를 만들어보세요!</p>
              </div>
              <Button 
                onClick={handleCreateNewAvatar}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                첫 아바타 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {savedAvatars.map((avatar) => (
                <Card 
                  key={avatar.id}
                  className={cn(
                    "relative cursor-pointer hover:shadow-lg transition-all",
                    selectedAvatarId === avatar.id && "ring-2 ring-purple-600",
                    currentAvatar?.id === avatar.id && "bg-purple-50"
                  )}
                  onClick={() => handleSelectAvatar(avatar.id)}
                >
                  {currentAvatar?.id === avatar.id && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      사용 중
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="aspect-square bg-gradient-to-br from-purple-200 to-blue-200 rounded-lg mb-4" />
                    <CardTitle className="text-center">{avatar.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditAvatar(avatar.id)
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateAvatar(avatar.id)
                        }}
                      >
                        복제
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAvatar(avatar.id)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add New Avatar Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2"
                onClick={handleCreateNewAvatar}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px]">
                  <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">새 아바타 추가</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            {selectedAvatarId && (
              <div className="flex justify-center space-x-4">
                <Button
                  size="lg"
                  onClick={handleUseAvatar}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  이 아바타 사용하기
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}