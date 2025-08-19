'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWorldStore } from '@/shared/stores/world-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, PlusCircle, Edit3, Play, Share2, Settings, Trash2, Users, Eye, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WorldsListPage() {
  const router = useRouter()
  
  const savedWorlds = useWorldStore((state) => state.savedWorlds)
  const deleteWorld = useWorldStore((state) => state.deleteWorld)
  const selectWorld = useWorldStore((state) => state.selectWorld)

  const handleCreateWorld = () => {
    console.log('Create world clicked - navigating to /worlds/create')
    router.push('/worlds/create')
  }

  const handleEditWorld = (worldId: string) => {
    selectWorld(worldId)
    router.push(`/worlds/${worldId}/edit`)
  }

  const handlePlayWorld = (worldId: string) => {
    selectWorld(worldId)
    router.push(`/worlds/${worldId}/play`)
  }

  const handleShareWorld = (worldId: string) => {
    // TODO: Implement share functionality
    alert('공유 기능은 준비 중입니다!')
  }

  const handleWorldSettings = (worldId: string) => {
    // TODO: Implement world settings
    alert('설정 기능은 준비 중입니다!')
  }

  const handleDeleteWorld = (worldId: string) => {
    if (confirm('이 월드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteWorld(worldId)
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
              <h1 className="text-2xl font-bold">내 월드 관리</h1>
            </div>
            <Link href="/worlds/create">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                새 월드 만들기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* World Grid */}
        {savedWorlds.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">아직 월드가 없습니다</h3>
                <p className="text-gray-600 mt-2">첫 번째 월드를 만들어보세요!</p>
              </div>
              <Link href="/worlds/create">
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  첫 월드 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedWorlds.map((world) => (
              <Card 
                key={world.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-200 to-blue-200 rounded-t-lg relative">
                  {world.visibility === 'public' && (
                    <Badge className="absolute top-2 right-2">공개</Badge>
                  )}
                  {world.visibility === 'private' && (
                    <Badge variant="secondary" className="absolute top-2 right-2">비공개</Badge>
                  )}
                  {world.visibility === 'friends' && (
                    <Badge variant="outline" className="absolute top-2 right-2">친구 공개</Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle>{world.name}</CardTitle>
                  <CardDescription>{world.description || '설명 없음'}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{world.stats?.visits || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>{world.stats?.likes || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>최대 {world.maxPlayers || 50}명</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePlayWorld(world.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      입장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditWorld(world.id)}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      편집
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareWorld(world.id)}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      공유
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWorldSettings(world.id)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      설정
                    </Button>
                  </div>
                  
                  {/* Delete Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteWorld(world.id)}
                    className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    삭제
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New World Card */}
            <Link href="/worlds/create">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2"
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">새 월드 추가</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}