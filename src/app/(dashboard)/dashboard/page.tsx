'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/auth/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAvatarStore } from '@/shared/stores/avatar-store'
import { useWorldStore } from '@/shared/stores/world-store'
import { PlusCircle, Users, Globe, Sparkles, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const savedAvatars = useAvatarStore((state) => state.savedAvatars)
  const savedWorlds = useWorldStore((state) => state.savedWorlds)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Flux Studio
              </h1>
              <nav className="hidden md:flex space-x-6">
                <button className="text-gray-700 hover:text-purple-600 font-medium">내 공간</button>
                <button 
                  onClick={() => router.push('/worlds/explore')}
                  className="text-gray-700 hover:text-purple-600 font-medium"
                >
                  탐험
                </button>
                <button 
                  onClick={() => router.push('/friends')}
                  className="text-gray-700 hover:text-purple-600 font-medium"
                >
                  친구
                </button>
                <button className="text-gray-700 hover:text-purple-600 font-medium">상점</button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {user?.name || '사용자'}님! 👋
          </h2>
          <p className="text-gray-600">오늘은 어떤 모험을 떠나볼까요?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* My Avatars */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => router.push('/avatar')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>내 아바타</span>
                <Users className="h-5 w-5 text-purple-600" />
              </CardTitle>
              <CardDescription>
                {savedAvatars.length}개의 아바타 보유
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {savedAvatars.slice(0, 3).map((avatar) => (
                  <div key={avatar.id} className="w-12 h-12 bg-gray-200 rounded-full" />
                ))}
                <Button size="sm" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  새로 만들기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Worlds */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/worlds')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>내 월드</span>
                <Globe className="h-5 w-5 text-blue-600" />
              </CardTitle>
              <CardDescription>
                {savedWorlds.length}개의 월드 생성
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedWorlds.length > 0 ? (
                  <div className="text-sm text-gray-600">
                    최근: {savedWorlds[0].name}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    아직 생성한 월드가 없습니다
                  </div>
                )}
                <Button size="sm" variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  월드 만들기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Friends Activity */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/friends')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>친구 활동</span>
                <Sparkles className="h-5 w-5 text-yellow-600" />
              </CardTitle>
              <CardDescription>
                온라인 친구 0명
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                친구를 추가하고 함께 플레이하세요!
              </div>
              <Button size="sm" variant="outline" className="w-full mt-2">
                친구 찾기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Worlds */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
            추천 월드
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-purple-200 to-blue-200 rounded-t-lg" />
                <CardContent className="p-4">
                  <h4 className="font-semibold">샘플 월드 {i}</h4>
                  <p className="text-sm text-gray-600">방문자 0명</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}