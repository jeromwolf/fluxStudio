'use client';

import { PlusCircle, Users, Globe, Sparkles, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/core/auth/hooks';
import { useAvatarStore } from '@/shared/stores/avatar-store';
import { useWorldStore } from '@/shared/stores/world-store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const savedAvatars = useAvatarStore((state) => state.savedAvatars);
  const savedWorlds = useWorldStore((state) => state.savedWorlds);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                Flux Studio
              </h1>
              <nav className="hidden space-x-6 md:flex">
                <button className="font-medium text-gray-700 hover:text-purple-600">내 공간</button>
                <button
                  onClick={() => router.push('/worlds/explore')}
                  className="font-medium text-gray-700 hover:text-purple-600"
                >
                  탐험
                </button>
                <button
                  onClick={() => router.push('/friends')}
                  className="font-medium text-gray-700 hover:text-purple-600"
                >
                  친구
                </button>
                <button className="font-medium text-gray-700 hover:text-purple-600">상점</button>
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            안녕하세요, {user?.name || '사용자'}님! 👋
          </h2>
          <p className="text-gray-600">오늘은 어떤 모험을 떠나볼까요?</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* My Avatars */}
          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => router.push('/avatar')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>내 아바타</span>
                <Users className="h-5 w-5 text-purple-600" />
              </CardTitle>
              <CardDescription>{savedAvatars.length}개의 아바타 보유</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {savedAvatars.slice(0, 3).map((avatar) => (
                  <div key={avatar.id} className="h-12 w-12 rounded-full bg-gray-200" />
                ))}
                <Button size="sm" variant="outline">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  새로 만들기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Worlds */}
          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => router.push('/my-worlds')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>내 월드</span>
                <Globe className="h-5 w-5 text-blue-600" />
              </CardTitle>
              <CardDescription>{savedWorlds.length}개의 월드 생성</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedWorlds.length > 0 ? (
                  <div className="text-sm text-gray-600">최근: {savedWorlds[0].name}</div>
                ) : (
                  <div className="text-sm text-gray-500">아직 생성한 월드가 없습니다</div>
                )}
                <Button size="sm" variant="outline" className="w-full">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  월드 만들기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Friends Activity */}
          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => router.push('/friends')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>친구 활동</span>
                <Sparkles className="h-5 w-5 text-yellow-600" />
              </CardTitle>
              <CardDescription>온라인 친구 0명</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">친구를 추가하고 함께 플레이하세요!</div>
              <Button size="sm" variant="outline" className="mt-2 w-full">
                친구 찾기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Worlds */}
        <div>
          <h3 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-600" />
            추천 월드
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="cursor-pointer transition-shadow hover:shadow-lg">
                <div className="aspect-video rounded-t-lg bg-gradient-to-br from-purple-200 to-blue-200" />
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
  );
}
