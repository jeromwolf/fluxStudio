'use client';

import {
  ChevronRight,
  PlusCircle,
  Edit3,
  Play,
  Share2,
  Settings,
  Trash2,
  Users,
  Eye,
  Heart,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useWorldStore } from '@/shared/stores/world-store';

export default function WorldsListPage() {
  const router = useRouter();

  const savedWorlds = useWorldStore((state) => state.savedWorlds);
  const deleteWorld = useWorldStore((state) => state.deleteWorld);
  const selectWorld = useWorldStore((state) => state.selectWorld);

  const handleCreateWorld = () => {
    console.log('Create world clicked - navigating to /my-worlds/create');
    router.push('/my-worlds/create');
  };

  const handleEditWorld = (worldId: string) => {
    selectWorld(worldId);
    router.push(`/my-worlds/${worldId}/edit`);
  };

  const handlePlayWorld = (worldId: string) => {
    selectWorld(worldId);
    router.push(`/my-worlds/${worldId}/play`);
  };

  const handleShareWorld = (worldId: string) => {
    // TODO: Implement share functionality
    alert('공유 기능은 준비 중입니다!');
  };

  const handleWorldSettings = (worldId: string) => {
    // TODO: Implement world settings
    alert('설정 기능은 준비 중입니다!');
  };

  const handleDeleteWorld = (worldId: string) => {
    if (confirm('이 월드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteWorld(worldId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="mb-8 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
                돌아가기
              </Button>
              <h1 className="text-2xl font-bold">내 월드 관리</h1>
            </div>
            <Link href="/my-worlds/create">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" />새 월드 만들기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {/* World Grid */}
        {savedWorlds.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <div className="mb-4">
                <div className="mx-auto mb-4 h-24 w-24 rounded-lg bg-gray-200" />
                <h3 className="text-lg font-semibold text-gray-900">아직 월드가 없습니다</h3>
                <p className="mt-2 text-gray-600">첫 번째 월드를 만들어보세요!</p>
              </div>
              <Link href="/my-worlds/create">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <PlusCircle className="mr-2 h-4 w-4" />첫 월드 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedWorlds.map((world) => (
              <Card key={world.id} className="transition-shadow hover:shadow-lg">
                <div className="relative aspect-video rounded-t-lg bg-gradient-to-br from-purple-200 to-blue-200">
                  {world.visibility === 'public' && (
                    <Badge className="absolute top-2 right-2">공개</Badge>
                  )}
                  {world.visibility === 'private' && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      비공개
                    </Badge>
                  )}
                  {world.visibility === 'friends' && (
                    <Badge variant="outline" className="absolute top-2 right-2">
                      친구 공개
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle>{world.name}</CardTitle>
                  <CardDescription>{world.description || '설명 없음'}</CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Stats */}
                  <div className="mb-4 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      <span>{world.stats?.visits || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="mr-1 h-4 w-4" />
                      <span>{world.stats?.likes || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
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
                      <Play className="mr-1 h-3 w-3" />
                      입장
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditWorld(world.id)}>
                      <Edit3 className="mr-1 h-3 w-3" />
                      편집
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShareWorld(world.id)}>
                      <Share2 className="mr-1 h-3 w-3" />
                      공유
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWorldSettings(world.id)}
                    >
                      <Settings className="mr-1 h-3 w-3" />
                      설정
                    </Button>
                  </div>

                  {/* Delete Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteWorld(world.id)}
                    className="mt-2 w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    삭제
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Add New World Card */}
            <Link href="/my-worlds/create">
              <Card className="cursor-pointer border-2 border-dashed transition-shadow hover:shadow-lg">
                <CardContent className="flex h-full min-h-[400px] flex-col items-center justify-center">
                  <PlusCircle className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="font-medium text-gray-600">새 월드 추가</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
